# Astro 遷移與視覺重設計驗證紀錄

日期：2026-09-27（Asia/Taipei）。本地實作與安全／靜態回歸已完成；CodePen 嵌入有相容性缺口，Gate B 保留此項，尚未進入遠端發布。

## Objective

將 VuePress 1／Vue 2／webpack 4 部落格改為 Astro 靜態網站，保留文章、公開網址、圖片與訂閱；依追加授權重新設計視覺，降低舊依賴安全負擔。

## Background 與決策

- 原工作區：`/Users/kengp3/Workspaces/mine/blog`，HEAD `0ef11cea2b7fd78e9b6cc535488df1515223d1b4`。原區域未修改網站程式，仍只有先前未提交的 `docs/`。
- 隔離工作區：`/Users/kengp3/.codex/worktrees/astro-migration/blog`，分支 `codex/astro-migration`。尚未 commit、push 或建立 PR。
- 使用者確認留言採 GitHub Issues 連結，暫不啟用追蹤；另明確授權視覺重設計，使用 gpt-taste、design-taste-frontend。
- 依 Agent Skills 進行遷移、依賴檢查及分段建置；依 Ponytail 使用原生 CSS、dialog、details 與少量 JavaScript，不加入 React、Vue、GSAP 或主題框架。
- 保留 KEN.LOGS、原導覽名稱、青綠色方向與 CC 授權文字。新增可讀性較好的編輯式版面、明暗模式、自架 Outfit 字體及示意封面。

## Materials 與版本

本次直接查證並安裝 [Astro 7.3.5](https://registry.npmjs.org/astro/7.3.5)、[@astrojs/rss 4.0.19](https://registry.npmjs.org/@astrojs/rss/4.0.19)、[@astrojs/sitemap 3.7.4](https://registry.npmjs.org/@astrojs/sitemap/3.7.4)。Node 24.21.0 LTS 與隨附 npm 11.19.0 依 [Node 官方發布資料](https://nodejs.org/dist/index.json)，macOS ARM64 tarball 通過官方 SHASUMS256 比對。

- `fast-xml-parser` 5.11.1、`ultrahtml` 1.6.0 原已在新框架依賴圖內；為 smoke test 的直接 import 明列 devDependencies，未增加另一套測試框架。
- 所有正式依賴固定版本，僅保留 `package-lock.json`。最終 lockfile 從沒有舊 Yarn lockfile／node_modules 的獨立暫存目錄產生，再以 `npm ci --ignore-scripts` 重現。
- Node/npm 分別固定在 `.nvmrc`、`packageManager`／`engines`。沒有更動使用者的全域 Node 或 npm。
- 原文章文字與程式碼內容保留，只調整日期 metadata、permalink、摘要、圖片／文章連結相容性、舊錨點及 CodePen 包裝。`shell script` fence 正規化為 `shell`，不改指令內容。

參考官方 [Content Collections](https://docs.astro.build/en/guides/content-collections/)、[RSS](https://docs.astro.build/en/recipes/rss/) 及 [sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)。未使用對話中無法取得的研究附件作為完整證據。

## 安全結果

| 項目 | 當前證據 |
| --- | --- |
| GitHub 舊基準 | 142 筆 open alerts、67 個套件；Critical 13、High 62、Medium 48、Low 19，皆來自舊 Yarn graph |
| 初次 Astro 候選 | 發現 picomatch 2.3.0 的 High／Moderate advisory；相容 patch 更新後為 0，未使用 `--force` 或 overrides |
| 最終 npm audit | info／low／moderate／high／critical 全部 0，服務成功回傳；見 `final-audit.json` |
| 舊警報逐項比對 | 正規化 GHSA＋套件＋受影響版本範圍，共 142 筆；比對最終 lockfile 的命中 0、無法解析範圍 0 |
| 依賴規模 | lockfile 包含 302 個套件節點，含各平台 optional packages；macOS 實際安裝 203、audit 顯示 204（含 root）。不與 GitHub alerts 數量相減 |
| 舊 runtime | 新 lockfile 無 Vue、VuePress、webpack 或 @vssue 依賴鏈 |
| Lifecycle scripts | 全程禁用。metadata 標示 esbuild／fsevents 有安裝腳本，實際 build 無需啟用任何一個 |
| 瀏覽器追蹤 | 無 UA／GA4／Vssue；字體、頭像均自架。CodePen 是保留的第三方嵌入，與 Analytics 決策分開 |

picomatch 的修補版本與觸發條件對照 [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj)。這是本機依賴圖的結果，**不表示 GitHub 已關閉 142 個警報**；遠端預設分支尚未更新。

## 內容、功能與驗證

| 驗證項目 | 結果 |
| --- | --- |
| 正式 static build | macOS ARM64、Node 24.21.0／npm 11.19.0 通過；獨立暫存 checkout 的 clean install／build 亦通過 |
| Smoke | 3 組測試通過，無 skipped；使用 Node 內建 test runner |
| 公開頁面 | 13 個既有頁面保留：首頁、About、4 文章、Tags 與 6 個標籤頁 |
| 靜態 HTTP | 35 個產物逐一 localhost HTTP 200，回傳 bytes 與 dist 檔案相同 |
| 連結／SEO | 全部本地 href/src、fragment、canonical、base、重複 ID 檢查通過；無 `/blog/blog/` 或殘留 `.md` 連結 |
| 文章圖片 | 8 張引用在瀏覽器逐一確認 `complete` 且 `naturalWidth > 0`；原 PNG 來源未更動，建置輸出 WebP |
| Public assets | favicon 與 coindesk 移至 public；coindesk SHA256 不變：`72df8073667580be5ad6e19c6d0c752a0dfa2fe0f9a63ed1a58231ea8646c0db` |
| Feed | RSS／Atom／JSON 保留原 URL 與 4 個永久 ID；XML／JSON 可解析、日期排序正確、特殊字元 round-trip 通過 |
| Feed 相容性 | 原站為摘要型 feed，新站沿用摘要形式。移除原本無效的 `~@alias` enclosure，修正 RSS self link，JSON 補 `content_text` |
| Sitemap | 官方 integration 產生 index 與分頁；`sitemap.xml` 是 index 的相容副本，涵蓋全部既有頁面 |
| 日期與重複路由 | 在獨立暫存環境注入 2020-02-30 與重複 permalink，兩者均使真實 build 拒絕；測後恢復，不污染工作區 |
| 留言 | Vssue 文章 → issue #4；日記 → issue #3（closed 保留）。兩者 `locked: false`；其他文章為手動建立入口，未寫入任何 issue |
| 搜尋 | Travis 命中 2 篇；不存在關鍵字顯示空狀態。Tab／Enter 可進入結果；Escape 清除 search input 後再按可關閉，焦點返回搜尋按鈕 |
| 圖片放大 | Enter 開啟、Escape 關閉，焦點回到原圖片按鈕；手機對話框寬度與 scrollWidth 相等，無橫向溢出 |
| 明暗／手機 | 1280×900、390×844 檢視首頁、文章、About、標籤；首頁明暗模式均截圖，無全頁橫向溢出 |
| 文字對比 | 共用 ink／muted／accent 對兩種底色，在明暗色票共 12 組全部 ≥ 4.5:1；最低 5.20:1 |
| Git diff | `git diff --check` 通過；原工作區未變，未暫存或提交變更 |

程式碼行號、閱讀目錄、平滑捲動、圖片放大與閱讀進度均有實作。VuePress nprogress 不再使用；新版採原生多頁導覽，沒有自訂頁面切換載入條。閱讀進度以 CSS scroll timeline 實作，不支援的瀏覽器仍可閱讀正文。

## 未通過或未驗證項目

1. **CodePen iframe 尚未通過。** 舊站的 CodePen 可以顯示；本地新版 iframe 仍空白。已比對原站 URL 參數並測試 eager 載入，未解決。不把此結果直接歸因於外部服務中斷。初版保留可展開嵌入與「在 CodePen 開啟」連結（後續已改回官方腳本，見補充），提供外連替代入口；未宣稱嵌入與原站等價。
2. 嘗試沿用原站較寬的 sandbox 權限時，自動核准審查拒絕：下載、表單、彈窗、頂層導覽等能力超出當前授權。該修改**沒有執行**，當時仍保留較窄的 `allow-scripts allow-same-origin allow-popups`。未透過其他腳本繞過此拒絕。
3. 留言沒有實際登入後送出驗證，避免寫入外部資料；closed／locked 與入口映射已確認，實際回覆權限由 GitHub 控制。
4. 未執行 Lighthouse、螢幕閱讀器 session、Firefox／Safari 或 reduced-motion 瀏覽器模擬。reduced-motion CSS 分支已檢視，不將 source review 當實測；沒有宣稱 Core Web Vitals 分數。
5. 新 GitHub Actions 尚未遠端執行；Linux clean install 與真正 Pages deployment 仍需 CI 確認。
6. 原文為歷史教學，含舊技術與憑證示例截圖；本次未改寫其教學或評估歷史憑證有效性。

## Boundaries 與發布

- CI 僅 build／audit／smoke／upload artifact，權限 `contents: read`、不使用 `pull_request_target`。checkout、setup-node、upload-artifact 皆固定官方 API 查證的 commit SHA。
- 每週 Dependabot 檢查 npm 與 Actions；npm minor／patch 分組，major 保持獨立。
- 未 commit、push、建立 PR、部署、變更 Pages source、停用 Travis、安裝 OAuth App 或寫入 Issues。
- `.travis.yml` 尚留在隔離來源，但已不適用新工具鏈；remote 變更之前必須處理舊發布者。不能直接拿它執行新版本部署。

## Evidence 與回退

原始證據在 `/private/tmp/blog-astro-evidence/`；暫存目錄可能被系統清理，正式切換前需再次封存或複製到核准的持久位置。

- `baseline-source-hashes.json`：原文章、圖片、public、package、lock 與 Travis 的 SHA256。
- `alerts.jsonl`、`baseline-normalized-alerts.json`、`security-comparison.json`：警報與版本範圍比對。
- `final-build.log`、`isolated-build.log`、`final-tests.log`、`final-audit.json`、`schema-checks.json`、`http-checks.json`、`contrast-checks.json`、`browser-checks.json`：驗證輸出。
- `home-desktop.png`、`home-mobile.png`、`home-dark.png`、`about-desktop.png`、`about-mobile.png` 及 `baseline-*.png`：本次與舊版畫面。
- `astro-site.tar.gz`：可審查的新版靜態 artifact，SHA256 `21d4c6accc8e2cf5df45d30233b06d371c543f3e43c0eabafb27485a89ac1d3a`。
- `old-deployment.tar.gz`：舊 gh-pages artifact，SHA256 `515c6ac4b9a84fb9668df7cfcb6ff7ddacd5177951b2f7282a4e29b7636d33d5`。
- `package-lock.json` SHA256：`713bf080114e41c7157c5e926f32df5918a2ae6f68bccad637473e831cf33299`。

舊 Pages source 為 `legacy`、`gh-pages:/`，已保存 commit `42eeedb1824a4a73aa636244709c8463c1b02575`。若後續核准的切換失敗，先暫停新發布，再用保存的舊產物／該 commit 恢復舊 branch source；不依賴臨時重建過時 VuePress，也不刪除 issues。

## Definition of Done 與交接

- Gate A：Go，新工具鏈與代表內容可行，無需引回 Vue 2／webpack 4。
- T4–T6：本地實作與列出的 build／audit／smoke 已完成。
- Gate B：**保留 CodePen 嵌入缺口**；可審查新版，但不宣稱全部功能等價。發布前需接受外連替代，或另行解決嵌入相容性。
- T7：未授權、未執行。正式升級完成需遠端 CI、Pages 切換、線上回歸與 GitHub alerts 重掃結果，皆不得由本地結果代替。

## CodePen 補充驗證（2026-09-27）

使用者在了解官方腳本會產生較寬權限後，授權先研究現行方式、失敗再試舊站方式。本次修改已通過自動核准審查。

- 官方 Classic 文件仍推薦 `.codepen` 容器＋`https://cpwebassets.codepen.io/assets/embed/ei.js`，也支援直接 iframe：https://blog.codepen.io/documentation/embedded-pens/ 。
- 現行文件方式實測：能產生 iframe，但 Codex 內建瀏覽器仍空白。
- 備案已套用：從 Git HEAD 取回舊文章原始 CodePen HTML 與 `https://static.codepen.io/assets/embed/ei.js`，保留額外外連入口，移除不再使用的 details CSS。沒有加入新套件。
- 舊寫法實測：Codex 內建瀏覽器仍空白；Chrome 顯示失敗 frame，frame body 為「codepen.io 拒絕連線。」。官方腳本有執行，失敗發生在 iframe 導覽／回應階段；未取得 HTTP response headers，不能斷言是 CSP、來源網域限制或防機器人規則。
- 較寬權限未消除故障，因此不能把先前 sandbox 差異認定為唯一根因。Gate B 仍保留此項，未發布。
- 本次 build 與 3 組 smoke tests 通過；smoke 檢查嵌入容器與官方 script 存在，不把靜態檢查當成外站載入成功。
- 前文 `astro-site.tar.gz` 與 HTTP bytes 檢查屬補充修改前的歷史產物，並非本次新 dist；正式發布前必須重新封存及驗證。
