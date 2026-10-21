# 廣告欄位

全站（首頁＋104 個工具頁）的廣告由這個資料夾控制，**改 `config.json` 就好，不用改程式**。
存檔推上 main 後，約 10–20 分鐘內全站生效（GitHub Pages 快取＋設定檔快取）。

## 總開關
- `enabled`: `false` 時全站不顯示任何廣告。
- `hideForMembers`: `true` 時已登入會員看不到廣告（可當作付費會員福利）。
- `excludePaths`: 不放廣告的頁面。

每個欄位**先放自售廣告，沒有可用的才放 AdSense**；兩種都沒有就不顯示，不留空白。
列印／PDF 一律不顯示廣告。

## 自售廣告（廠商直接贊助）
在 `house.items` 新增一筆，並把 `house.enabled` 設為 `true`：

| 欄位 | 說明 |
|---|---|
| `id` | 英數代號，GA 報表用來區分廠商（事件 `house_ad_impression`、`house_ad_click`） |
| `active` | `true` 才會顯示 |
| `placements` | `"home"` 首頁、`"tool"` 工具頁，可同時選 |
| `start` / `end` | 刊登期間（YYYY-MM-DD，含首尾日） |
| `weight` | 同時有多家廠商時的輪播比重 |
| `sponsor` / `title` / `text` | 廠商名稱、標題、一句話說明（建議 40 字內） |
| `image` | 選填，`https://` 圖片網址，建議 4:3（顯示 88×66） |
| `url` | 點擊後開啟的網址，必須是 `https://` |

報價時可以到 GA →「事件」看 `house_ad_impression` 次數，當作曝光量依據。

## Google AdSense
1. 到 https://adsense.google.com 用事務所的 Google 帳號申請，網站填 `juhongstructural.com`。
2. 取得發布商 ID（`ca-pub-` 加 16 位數字）後，在網站根目錄新增 `ads.txt`，內容一行：
   ```
   google.com, pub-你的16位數字, DIRECT, f08c47fec0942fa0
   ```
3. 審核通過後，在 AdSense 後台建立兩個「多媒體廣告」單元（首頁、工具頁），把各自的廣告單元 ID 填入 `adsense.slots.home` / `adsense.slots.tool`，`adsense.client` 填發布商 ID，`adsense.enabled` 設為 `true`。
4. 歐盟／英國訪客需要同意聲明：在 AdSense 後台「隱私權與訊息」啟用 Google 的同意訊息即可。

隱私權說明（privacy.html 第六節）已寫好兩種廣告的揭露文字。
