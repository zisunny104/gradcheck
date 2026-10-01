// 「授權」modal：內文讀根目錄 LICENSE（Markdown，以 ## 分章），第一次開啟時載入並轉成 HTML，
// 每章一個分頁。載入失敗只顯示簡短錯誤，不留空白。
//
// 本檔案完全自足（不使用 ES module），markdown 渲染邏輯與 dialog 邏輯合併寫在同一個 IIFE 內，
// 邏輯比照 printan 的 js/help/markdown.js + js/help/license-dialog.js。

(function () {
    "use strict";

    // ---- markdown.js 的部分 ----
    // 只支援說明書用到的語法：## 章／### 小標、段落、無序／有序清單、表格、引用（>）、水平線（---）、
    // 行內的 **粗體**、*斜體*、`行內碼`、[文字](連結)、[[按鍵]]（→ <kbd>）。
    // 安全：先把整段文字跳脫（& < > " '）再套標記，來源裡的 HTML 一律當純文字；
    // 連結只允許 http(s):// 與相對路徑（含 # 錨點），其餘（javascript:、data: …）不轉成連結。

    const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
    const ENTITY_CHARS = { quot: '"', "#39": "'", amp: "&" };
    const HOLD = "\u0000"; // 暫存已轉好的 HTML 用的占位符；輸入裡的 NUL 會先移除，來源文字無法偽造

    function safeHref(url) {
        if (/^https?:\/\/\S+$/i.test(url)) return url;
        // 相對路徑：不含協定、也不能是 // 開頭（protocol-relative 會跳到別的網站）
        if (/^[\w./#?=&%-]+$/.test(url) && !url.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
        return null;
    }

    /** 行內標記。輸入是原始文字，輸出已跳脫的 HTML。 */
    function renderInline(raw) {
        const held = [];
        const hold = (html) => `${HOLD}${held.push(html) - 1}${HOLD}`;
        let s = escapeHtml(raw.replaceAll(HOLD, ""));
        s = s.replace(/`([^`]{1,500})`/g, (_, code) => hold(`<code>${code}</code>`));
        s = s.replace(/\[\[([^\]]{1,50})\]\]/g, (_, key) => hold(`<kbd>${key}</kbd>`));
        // 網址在跳脫後 & " ' 已變成實體，還原後再檢查，輸出時再跳脫一次（否則 &quot; 會被二次跳脫成 &amp;quot;）
        s = s.replace(/\[([^\]]{1,300})\]\(([^)\s]{1,500})\)/g, (_, label, url) => {
            const href = safeHref(url.replace(/&(quot|#39|amp);/g, (_m, e) => ENTITY_CHARS[e]));
            if (!href) return label;
            const external = /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
            return hold(`<a href="${escapeHtml(href)}"${external}>${label}</a>`);
        });
        s = s.replace(/\*\*([^*]{1,500})\*\*/g, "<strong>$1</strong>");
        s = s.replace(/\*([^*]{1,500})\*/g, "<em>$1</em>");
        return s.replace(new RegExp(`${HOLD}(\\d+)${HOLD}`, "g"), (_, i) => held[Number(i)]);
    }

    const splitRow = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const isTableSep = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
    const BULLET = /^\s*[-*]\s+/;
    const NUMBERED = /^\s*\d+[.)]\s+/;

    /** 區塊層級：回傳 HTML 字串。 */
    function renderMarkdown(src) {
        const lines = src.replace(/\r\n?/g, "\n").split("\n");
        const out = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (!line.trim()) { i++; continue; }

            const heading = /^#{3,4}\s+(.*)$/.exec(line);
            if (heading) {
                out.push(`<div class="ts-header is-small">${renderInline(heading[1])}</div>`);
                i++;
            } else if (/^---+\s*$/.test(line)) {
                out.push('<div class="ts-divider"></div>');
                i++;
            } else if (line.includes("|") && isTableSep(lines[i + 1] ?? "")) {
                const head = splitRow(line);
                i += 2;
                const rows = [];
                while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(splitRow(lines[i++]));
                const th = head.map((c) => `<th>${renderInline(c)}</th>`).join("");
                const tr = rows.map((r) => `<tr>${head.map((_, k) => `<td>${renderInline(r[k] ?? "")}</td>`).join("")}</tr>`).join("");
                out.push(`<div class="help-table-wrap"><table class="ts-table is-celled"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`);
            } else if (BULLET.test(line) || NUMBERED.test(line)) {
                const marker = BULLET.test(line) ? BULLET : NUMBERED;
                const tag = marker === BULLET ? "ul" : "ol";
                const items = [];
                while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ""));
                out.push(`<${tag} class="help-list">${items.map((t) => `<li>${renderInline(t)}</li>`).join("")}</${tag}>`);
            } else if (/^>\s?/.test(line)) {
                const quote = [];
                while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""));
                out.push(`<blockquote class="help-quote">${renderInline(quote.join(" "))}</blockquote>`);
            } else {
                const para = [lines[i++]];
                while (i < lines.length && lines[i].trim() && !/^(#{3,4}\s|---+\s*$|>\s?)/.test(lines[i]) && !BULLET.test(lines[i]) && !NUMBERED.test(lines[i])) para.push(lines[i++]);
                out.push(`<p class="help-paragraph">${renderInline(para.join(" "))}</p>`);
            }
        }
        return out.join("");
    }

    /** 以 `## 章名` 切成章節：[{ title, body(原始 Markdown) }]；第一個 ## 之前的文字忽略。 */
    function splitChapters(src) {
        const chapters = [];
        for (const line of src.replace(/\r\n?/g, "\n").split("\n")) {
            const m = /^##\s+(.+?)\s*$/.exec(line);
            if (m) chapters.push({ title: m[1], body: "" });
            else if (chapters.length) chapters.at(-1).body += `${line}\n`;
        }
        return chapters;
    }

    // ---- license-dialog.js 的部分 ----

    function wireLicenseDialog() {
        const dialog = document.getElementById("license-dialog");
        const openButton = document.getElementById("btn-license");
        if (!dialog || !openButton) return;
        const tabsBox = dialog.querySelector(".help-tabs");
        const body = dialog.querySelector(".help-body");
        const src = dialog.dataset.licenseSrc;
        let loaded = false;
        let loading = null;

        function showError() {
            tabsBox.hidden = true;
            if (dialog.open) document.getElementById("btn-license-close")?.focus();
            body.textContent = "";
            const notice = document.createElement("div");
            notice.className = "ts-notice is-negative";
            const content = document.createElement("div");
            content.className = "content";
            content.textContent = "授權資訊載入失敗，請關閉後再開一次。";
            notice.appendChild(content);
            body.appendChild(notice);
        }

        function select(name, { focus = false } = {}) {
            for (const tab of tabsBox.children) {
                const active = tab.dataset.licenseTab === name;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", String(active));
                tab.tabIndex = active ? 0 : -1; // roving tabindex：Tab 只停在目前分頁，方向鍵切換
                if (active && focus) tab.focus();
            }
            for (const panel of body.children) panel.hidden = panel.dataset.licensePanel !== name;
            body.scrollTop = 0;
        }

        tabsBox.addEventListener("keydown", (e) => {
            const tabs = [...tabsBox.children];
            const current = tabs.findIndex((t) => t === document.activeElement);
            if (current < 0) return;
            const next = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 }[e.key];
            if (next === undefined) return;
            e.preventDefault();
            select(String((next + tabs.length) % tabs.length), { focus: true });
        });

        function build(chapters) {
            tabsBox.hidden = false;
            tabsBox.textContent = "";
            body.textContent = "";
            chapters.forEach((chapter, index) => {
                const name = String(index);
                const tab = document.createElement("button");
                tab.type = "button";
                tab.className = "item";
                tab.id = `license-tab-${name}`;
                tab.setAttribute("role", "tab");
                tab.setAttribute("aria-controls", `license-panel-${name}`);
                tab.dataset.licenseTab = name;
                tab.textContent = chapter.title;
                tab.addEventListener("click", () => select(name));
                tabsBox.appendChild(tab);
                const panel = document.createElement("div");
                panel.id = `license-panel-${name}`;
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-labelledby", `license-tab-${name}`);
                panel.dataset.licensePanel = name;
                panel.innerHTML = renderMarkdown(chapter.body); // 已先跳脫再套標記
                body.appendChild(panel);
            });
            select("0");
            loaded = true;
        }

        function load() {
            if (loaded || loading) return;
            loading = fetch(src)
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.text();
                })
                .then((text) => {
                    const chapters = splitChapters(text);
                    if (!chapters.length) throw new Error("沒有章節");
                    build(chapters);
                    if (dialog.open) tabsBox.querySelector('[tabindex="0"]')?.focus();
                })
                .catch((err) => {
                    console.error("授權資訊載入失敗", err);
                    showError();
                })
                .finally(() => { loading = null; });
        }

        // 開啟時焦點放在目前分頁（還在載入或失敗時放在關閉鈕）；Esc 由 <dialog> 原生處理，
        // 關閉後（Esc 或關閉鈕）焦點明確還給開啟鈕。
        openButton.addEventListener("click", () => {
            dialog.showModal();
            load();
            (tabsBox.querySelector('[tabindex="0"]') ?? document.getElementById("btn-license-close"))?.focus();
        });
        dialog.addEventListener("close", () => openButton.focus());
        document.getElementById("btn-license-close")?.addEventListener("click", () => dialog.close());
    }

    document.addEventListener("DOMContentLoaded", wireLicenseDialog);
})();
