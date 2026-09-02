# KoiLiSu GradCheck - 畢業資格審查表下載工具

> 亞洲大學學生畢業資格審查表下載工具

## 介紹

KoiLiSu GradCheck 是一個專為亞洲大學學生設計的畢業資格審查表下載工具，支援批次下載多個學號的審查表。

## 特色

✅ **批次下載**：支援多學號同時處理  
✅ **自動計算**：智能計算下載參數  
✅ **現代化介面**：基於 Tocas UI 5.0.3  
✅ **深淺色主題**：支援主題切換  
✅ **響應式設計**：適配各種裝置  

## 使用方法

1. 輸入學號（支援多個，用逗號或空格分隔）
2. 系統自動驗證學號格式（9位數字）
3. 點擊生成的下載按鈕
4. 系統會開啟新視窗下載 PDF

## 技術說明

### 參數計算邏輯

```javascript
// 計算 sel_std_no_q
const sel_std_no_q = 1688 * (studentId + 1);

// 計算 std_para  
const last4 = studentId % 10000;
const std_para = 9999 - last4;

// 取得入學年份
const std_cos_year_q = Math.floor(studentId / 1000000);
```

### 下載 URL 格式

```
https://webap2.asia.edu.tw/stdgrad/prg_GR/IN0009_Rpt.aspx?sel_std_no_q={計算值}&std_para={計算值}&std_cos_year_q={年份}&type_no_q=0&type_name_q=
```

## 安裝

### 獨立使用

1. 克隆倉庫：
```bash
git clone https://github.com/zisunny104/gradcheck.git
cd gradcheck
```

2. 配置網頁伺服器

3. 直接訪問 `index.php`

### 與 KoiLiSu 開利手整合

1. 將此倉庫放置在 `koilisu/apps/gradcheck/` 目錄
2. 透過 `https://toka.dev/koilisu/gradcheck` 造訪

## 版本歷史

### v1.0.0
- 初版發布
- 支援單一和批次學號下載
- 現代化使用者介面
- 深淺色主題支援

## 系統需求

- PHP 7.4+
- 現代瀏覽器
- 需要校內網路或 VPN 連線

## 注意事項

⚠️ 此工具僅適用於亞洲大學學生使用  
⚠️ 需要校內網路環境或 VPN 連線  
⚠️ 請遵守學校相關規定使用  

## 授權

MIT License，詳見 [LICENSE](LICENSE)。

## 作者

Tokas (Xiang-zi Xie)