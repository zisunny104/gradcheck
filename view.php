<!DOCTYPE html>
<html id="html" class="is-rounded">

<head>
    <meta charset="UTF-8">
    <title>畢業資格審查表下載工具 - KoiLiSu</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tocas-ui/5.0.3/tocas.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tocas-ui/5.0.3/tocas.min.js"></script>

    <style type="text/css">
    /* 現代 sticky footer 布局 */
    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .main-content {
        flex: 1;
    }

    .segment {
        max-width: 300px;
    }

    .download-buttons {
        display: grid;
        gap: 10px;
        margin-top: 20px;
    }

    .button-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
    }
    </style>
    <script id="clientEventHandlersJS" language="javascript" type="text/javascript">
    function validateStudentId(id) {
        return /^\d{9}$/.test(id.trim());
    }

    function downloadGradCheck(seltxt) {
        if (seltxt == null || seltxt == "") {
            alert("請輸入有效的學號");
            return false;
        }

        const studentId = parseInt(seltxt);

        // 計算 sel_std_no_q (根據提供的算法)
        const sel_std_no_q = 1688 * (studentId + 1);

        // 計算 std_para (根據提供的算法)
        const last4 = studentId % 10000;
        const std_para = 9999 - last4;

        // 取得入學年份 (學號前3位)
        const std_cos_year_q = Math.floor(studentId / 1000000);

        // 建構下載 URL
        const baseUrl = "https://webap2.asia.edu.tw/stdgrad/prg_GR/IN0009_Rpt.aspx";
        const params = new URLSearchParams({
            'sel_std_no_q': sel_std_no_q,
            'std_para': std_para,
            'std_cos_year_q': std_cos_year_q,
            'type_no_q': '0',
            'type_name_q': ''
        });

        const downloadUrl = `${baseUrl}?${params.toString()}`;

        // 開啟新視窗下載
        window.open(downloadUrl, '_blank');

        return false;
    }

    function generateDownloadButtons() {
        const inputText = document.getElementById("seltxt").value;
        const buttonContainer = document.getElementById("downloadButtons");
        buttonContainer.innerHTML = ''; // Clear existing buttons

        // 分割輸入（支援 空白、英文逗號、中文逗號）
        const studentIds = inputText.split(/[\s,，]+/)
            .map(id => id.trim())
            .filter(id => id.length > 0);

        // 篩選有效 ID
        const validIds = studentIds.filter(id => validateStudentId(id));

        // Only show buttons if there are valid IDs
        if (validIds.length > 0) {
            // Add individual buttons for valid IDs
            validIds.forEach(id => {
                const buttonRow = document.createElement("div");
                buttonRow.className = "button-row";

                // 建立下載按鈕
                const button = document.createElement("button");
                button.className = "ts-button is-circular is-primary";
                button.innerHTML = `<span class="ts-icon is-graduation-cap-icon"></span>「 ${id} 」畢業資格審查表`;
                button.onclick = () => downloadGradCheck(id);

                // 將按鈕加入按鈕行
                buttonRow.appendChild(button);

                // 將按鈕行加入容器
                buttonContainer.appendChild(buttonRow);
            });
        }
    }
    </script>
</head>

<body>
    <div class="main-content">
        <div class="ts-container is-narrow has-vertically-padded-big">
            <div class="content">
                <div class="ts-header is-huge is-icon is-heavy">
                    <div class="ts-icon is-graduation-cap-icon"></div>
                    畢業資格審查表下載工具 <span style="font-size:1rem;color:#888;">v1.0.0</span>
                </div>

                <div class="ts-box has-top-spaced-large" style="width: 100%">
                    <div class="ts-content">
                        <div class="ts-wrap is-vertical">
                            <div class="ts-text is-label">學號</div>
                            <div class="ts-input is-start-icon is-underlined">
                                <span class="ts-icon is-id-card-icon"></span>
                                <input type="text" id="seltxt" placeholder="113151000"
                                    onchange="generateDownloadButtons()" onkeyup="generateDownloadButtons()">
                            </div>

                            <div id="downloadButtons" class="download-buttons">
                                <!-- Download buttons will be generated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 開利手底部 -->
    <div class="ts-content is-secondary is-vertically-padded">
        <div class="ts-container">
            <div class="ts-grid">
                <div class="column is-fluid">
                    <div class="ts-text is-description">
                        <a href="/koilisu/" style="color: inherit; text-decoration: none;">KoiLiSu 開利手</a> -
                        讓工具使用更順手的開放專案 | prjToka
                    </div>
                    <div class="ts-text is-description">
                        Built with ❤️ using Tocas UI
                    </div>
                </div>
                <div class="column is-end-aligned">
                    <div class="ts-selection is-circular is-compact">
                        <label class="item">
                            <input type="radio" name="theme" value="light" id="theme-light">
                            <div class="text">淺色</div>
                        </label>
                        <label class="item">
                            <input checked type="radio" name="theme" value="system" id="theme-system">
                            <div class="text">系統</div>
                        </label>
                        <label class="item">
                            <input type="radio" name="theme" value="dark" id="theme-dark">
                            <div class="text">深色</div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    // 深淺色模式功能
    function setTheme(theme) {
        document.getElementById('html').className = theme === 'system' ?
            'is-rounded' :
            `is-rounded is-${theme}`;

        // Save theme preference to cookie
        document.cookie = `preferred-theme=${theme}; path=/; max-age=31536000`; // 1 year
    }

    function getPreferredTheme() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'preferred-theme') {
                return value;
            }
        }
        return 'system'; // Default theme
    }

    // 初始化主題
    document.addEventListener('DOMContentLoaded', function() {
        const preferredTheme = getPreferredTheme();
        const themeRadio = document.getElementById(`theme-${preferredTheme}`);
        if (themeRadio) {
            themeRadio.checked = true;
            setTheme(preferredTheme);
        }
    });

    // Theme change event listeners
    document.getElementById('theme-light').addEventListener('change', function() {
        if (this.checked) {
            setTheme('light');
        }
    });

    document.getElementById('theme-dark').addEventListener('change', function() {
        if (this.checked) {
            setTheme('dark');
        }
    });

    document.getElementById('theme-system').addEventListener('change', function() {
        if (this.checked) {
            setTheme('system');
        }
    });
    </script>
</body>

</html>