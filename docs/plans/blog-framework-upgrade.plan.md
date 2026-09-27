# VuePress 1 → Astro 部落格升級計畫

狀態：已獲授權部署至 GitHub Pages；正式站 CodePen 驗證通過，open Dependabot alerts 為 0。日期：2026-09-27（Asia/Taipei）。

執行工作區：`/Users/kengp3/.codex/worktrees/astro-migration/blog`，分支 `codex/astro-migration`。實際證據與限制見 [遷移驗證紀錄](../research/astro-migration.research.md)。

## Objective

以 Astro 靜態網站取代 VuePress 1／Vue 2／webpack 4，移除舊依賴鏈，保留既有文章、網址、靜態資產及必要功能，並規劃由 GitHub Actions 發布至 GitHub Pages。先完成小型 PoC，證明內容、網址與依賴安全可接受，再展開完整遷移。

本計畫接替 [原依賴安全修補計畫](./dependency-security.plan.md)。不再以先修完 VuePress 的 142 個警報作為遷移前提；原版僅用於必要的基準比對與回退。

## Background

- 根目錄：`/Users/kengp3/Workspaces/mine/blog`；本機 HEAD：`0ef11cea2b7fd78e9b6cc535488df1515223d1b4`。
- 本機有 4 篇 Markdown、About.vue、少量 Stylus；原工具鏈版本與安全快照見原計畫。142 alerts 是同日先前實際查詢結果，不等於遷移後仍會存在，也不是本次已完成修補。
- 已讀取 ChatGPT 對話「研究部落格框架」的任務定義與結論。對話中的研究 Markdown 附件未由工具取得，本機亦不存在；本計畫沒有把對話摘要冒充完整研究文件。
- Astro 方向採研究推薦，但版本、部署方式及本機需求以本次直接查證為準。Hugo 留作 PoC 無法符合維護目標時的備選，不同時實作兩個框架。
- GitHub Pages API 目前為 `build_type: legacy`，來源 `gh-pages:/`，狀態 `built`；新方案需要切換至 Actions，並處理舊發布來源的停用與回退。

## Materials

| 一手來源／專案材料 | 本次確認結果或用途 |
| --- | --- |
| `package.json`、`yarn.lock`、`blog/.vuepress/` | 既有依賴與功能設定；不直接沿用舊 lockfile 到新框架 |
| `blog/_posts/2020/`、`blog/about/`、`blog/assets/` | 內容與圖片；保留歷史文章原意，不把文內舊教學順手改寫成新框架教學 |
| `blog/.vuepress/public/`、`.travis.yml` | public assets 與舊發布設定 |
| [研究對話](chatgpt-conversation://6ab9258f-6a6c-83ee-aeda-f345b1010364) | 研究方向；全文附件尚未取得 |
| [Astro 7.3.5 release](https://github.com/withastro/astro/releases/tag/astro%407.3.5)、[npm metadata](https://registry.npmjs.org/astro/latest) | 本次確認 stable 為 7.3.5，2026-09-24 發布；Node engine `>=22.12.0` |
| [Node 發布資料](https://nodejs.org/dist/index.json) | 本次 LTS 候選 24.21.0，隨附 npm 11.19.0 |
| [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)、[VuePress 遷移指南](https://docs.astro.build/en/guides/migrate-to-astro/from-vuepress/) | Markdown 資料載入、schema 與元件／樣式轉移 |
| [Astro Pages 部署](https://docs.astro.build/en/guides/deploy/github/)、[GitHub custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) | `site`／`base`、artifact 發布、Pages source、OIDC 權限 |
| [線上 sitemap](https://kengp3.github.io/blog/sitemap.xml)、[RSS](https://kengp3.github.io/blog/rss.xml) | 本次 HTTP 200，取得實際文章與標籤網址；不從檔名猜 production permalink |
| [既有留言 #4](https://github.com/kengp3/blog/issues/4) | Vssue 文章已有 1 則留言，必須保留資料可達性 |

上述版本已於執行時重新查 registry；Node 24.21.0、npm 11.19.0、Astro 7.3.5 已完成安裝、build 與 audit。最終 npm lockfile 從無舊 Yarn／node_modules 的暫存目錄重新產生，避免承接原解析結果。

## Boundaries

- 使用者已明確授權執行本地升級，並追加視覺重新設計；remote 授權邊界維持下列限制。
- 後續實作使用從當時確認 HEAD 建立／重用的隔離 managed worktree，分支建議 `codex/astro-migration`。本計畫目前未提交，須同步到隔離工作區後才執行，不假定它已存在於 Git HEAD。
- Markdown-first、靜態輸出，不加入資料庫、SSR adapter、CMS、MDX、React/Vue runtime 或完整主題框架，除非具體需求證明必要。
- 依追加授權重新設計版型、字體與明暗色票，保留品牌、導覽名稱、文章正文、標籤、About、圖片及公開 URL；不進行全文改寫或無關資產整理。
- 使用者已選定 GitHub Issues 連結，並明確選擇暫不啟用追蹤。新站移除 Vssue 與 UA，未新增 GA4。
- 本次不授權 commit、push、PR、Pages source 切換、Travis 停用、OAuth／GitHub App 安裝或 Issues／Discussions 寫入；部署前必須先交付可審查的結果。
- 依 `project-setting.md` 使用此檔作為唯一執行清單。後續證據彙整到 `docs/research/astro-migration.research.md`，不額外建立 `tasks/` 或重複的 todo。

## Assumptions 與技術選擇

| 項目 | 規劃選擇與理由 |
| --- | --- |
| 框架 | Astro 7.3.5 stable 候選，`output: static`；不以升級框架名稱代替安全驗證 |
| Runtime／套件管理 | Node 24.21.0 LTS＋npm 11.19.0 候選；新依賴圖用單一 `package-lock.json`，CI 使用 `npm ci`。改用 Node 隨附 npm 可省去 Yarn 的額外安裝與維護，舊 Yarn 僅用於原版診斷 |
| 網址 | `site: https://kengp3.github.io`、`base: /blog`、尾斜線策略維持現有頁面；資產、導覽、canonical、feed 全部驗證 base 只加入一次 |
| 內容 | Content Collections 的 loader 指向既有 `blog/_posts/`，避免無必要搬動 4 篇文章；frontmatter 保留 title、date、tags、author、location，增加明確 permalink 映射 |
| 日期 | 將非補零日期正規化為明確日期值，按日曆日排序與輸出，不依賴 `new Date('2020-2-7')` 的跨平台解析或時區偏移 |
| 樣式與元件 | 一個共用版型及必要頁面；About.vue 改成 Astro 標記＋普通 CSS，保留照片與內容，不為一個靜態元件安裝 Vue integration／Stylus |
| 高亮與互動 | 優先 Astro 內建高亮、CSS 平滑捲動、少量必要 JavaScript；縮放／閱讀進度保留可觀察行為與鍵盤操作。頁面切換進度條是否保留依實際導航方式說明，不假稱 native navigation 等價 |
| 訂閱與 SEO | `@astrojs/rss` 4.0.19、`@astrojs/sitemap` 3.7.4 為已查 registry 的候選；維持既有 Atom／JSON feed，相容性在 PoC 檢查點評估，不因 RSS 插件只處理 RSS 而漏掉其他格式 |
| 安裝政策 | 第一次安裝禁用 lifecycle scripts，確認需要的腳本及來源後只執行必要項目；不直接執行整包未知 starter 的安裝流程 |

選擇 npm 是本次新框架方案的一部分；全面切換前清除舊工具鏈的依賴宣告與舊 lockfile，不能留下兩種 manager 的正式安裝入口。

## 內容與功能遷移對照

| 現況 | 升級方式 | 驗收 |
| --- | --- | --- |
| `_posts` 四篇 Markdown | 保留檔案位置，collection schema＋明確路由 | 標題、日期、作者、標籤、排序及正文符合來源 |
| `~@alias/...` 共 8 個圖片引用 | 改成可攜式相對路徑指向原 `blog/assets/`，由 Astro build 處理 | 頁面及 feed 不含 `~@alias`；全部圖片可載入 |
| 文內相對 `.md` 連結、標題 anchor | 對照公開 URL 改寫受影響連結；必要時保留舊 anchor id | 站內文章與章節連結實際跳轉正常 |
| CodePen raw HTML／script | 先測普通 Markdown 的實際產物；必要時採單一頁面腳本或官方 iframe，保留 fallback 連結 | 範例可顯示，直接載入及導覽後都正常，不新增 MDX 只為此案例 |
| About.vue＋`blog/about/README.md` | 共用 Astro 版型＋既有介紹內容；移除不適用的 layout metadata | `/blog/about/` 直接載入、重新整理正常 |
| 標籤 | 從 collections 建立標籤索引及單一標籤頁 | 六個既有標籤網址與文章歸屬保留 |
| favicon／coindesk.json | 先可用 `publicDir` 指向舊 public，切換時搬至根 `public/`，依賴驗證後刪除舊平台設定 | JSON byte hash 不變，favicon 可用，來源不重複維護 |
| RSS／Atom／JSON feed | 共用同一份文章資料；RSS 用官方套件，Atom 優先小型且正確 escape 的靜態 serializer、JSON 用標準序列化；不足才評估單一維護中 feed 套件取代重複工具 | 三種訂閱 URL 保留，GUID／id 穩定，解析成功，含特殊字元的標題也正確 |
| sitemap／canonical | 官方 sitemap integration＋共用 SEO 標記 | 文章、About、標籤網址正確，無重複 `/blog/blog/` |
| Vssue | 方案見下節；不把 Vssue／Vue 2 裝回新站只為沿用 widget | 既有留言仍可找到，新互動方式經確認 |
| 舊 Google Analytics | 先確認是否仍需要測量與是否有 GA4 設定；需要時採官方 tag 與設定驗證 | 不沿用 UA 插件、不捏造測量 ID；未設定不得宣稱追蹤已通過 |

目前線上 RSS 的部分 enclosure URL 仍含 `~@alias`，並且 self link 指向 `feed.atom`；新輸出保留訂閱入口與文章識別，修正這些輸出錯誤，不把錯誤視為必須複製的相容行為。

## 必須保留的路徑

以下由本次線上首頁及 sitemap 取得；執行時另實測每個 URL 與舊 hash anchor，不能只檢查 Astro dev router。

```text
/blog/
/blog/about/
/blog/2020/02/05/start-blog/
/blog/2020/02/07/build-blog-with-vuepress/
/blog/2020/02/09/vuepress-comment-vssue/
/blog/2020/02/13/css-box-sizing/
/blog/tag/
/blog/tag/programming/
/blog/tag/css/
/blog/tag/javascript/
/blog/tag/vuepress/
/blog/tag/vssue/
/blog/tag/diary/
/blog/rss.xml
/blog/feed.atom
/blog/feed.json
/blog/sitemap.xml
/blog/favicon.ico
/blog/favicon-32x32.png
/blog/coindesk.json
```

`coindesk.json` 本機與線上內容本次 hash 相同：`72df8073667580be5ad6e19c6d0c752a0dfa2fe0f9a63ed1a58231ea8646c0db`。其他圖片輸出檔名可由 bundler 改變，但所有內容引用必須可用；不得把 GitHub Pages 不支援的 server redirect 當作保留 permalink 的方案。

## 留言決策（已確認）

使用者已選定：保留 GitHub Issues 作為留言資料，文章提供「查看／回覆 GitHub 留言」連結，移除嵌入式 Vssue 與 OAuth 流程。#4、#3 均未 locked；保留 #3 的 closed 狀態。未寫入或提交留言，登入後的帳號權限仍由 GitHub 控制。

- 本次讀取全部 open／closed issues：#4 為目前 Vssue 文章，1 則留言；#3 為開始寫部落格，已關閉且 0 則留言；#1／#2 是其他測試資料，不擅自映射或刪除。
- 若採連結方案，保留已關閉 issue 的歷史可讀性；分別確認 closed、locked 狀態與讀者權限，實測是否可回覆，不因 issue 關閉就自動重開。無 issue 的文章可提供手動建立 issue 入口，不自動替使用者建立 issue。
- 若選 [giscus](https://giscus.app/)，另列 GitHub Discussions 啟用、App 安裝、權限、分類及舊留言對映／轉移方案；先保留舊 issues 的連結，不假設 giscus 直接讀取 Vssue issues。
- Analytics 決策也已確認為暫不啟用；不需要 Measurement ID 即可完成本次本地版本。

## 任務順序與檢查點

```text
T1 基準 → T2 Astro 最小環境 → T3 代表內容 PoC → Gate A
→ T4 全站內容與外觀 → T5 訂閱與外部整合 → T6 安全收尾與 CI → Gate B
→ T7 獲授權後正式切換及驗證
```

### T1：固定內容、安全與發布基準（S）

- [x] 記錄當時 HEAD、source／lockfile／public asset hash、完整 GitHub alerts、Pages source 與 `gh-pages` HEAD；保存舊部署 artifact／可重部署快照。
- [x] 以實際瀏覽器記錄首頁、圖片文章、CodePen、About 的桌面／手機畫面，盤點搜尋、圖片縮放及其他現有互動；記錄文章與留言映射。
- [x] 建立隔離工作區並保留原工作樹。若舊 build 無法重現，以已發布產物加本機內容為基準，列明差異；不為建立基準先全面修補 VuePress。

驗證：來源 hash 可重算、Pages 與 URL 清單可追溯，baseline 不含憑證。依賴：無。文件：`docs/research/astro-migration.research.md`；原始紀錄放隔離暫存位置並在報告保留必要結果。

### T2：建立最小 Astro 環境（M）

- [x] 先建立獨立最小候選，固定 Astro／Node／npm，依 engine 與公告驗證；使用 `package-lock.json`，不把舊 `yarn.lock` 拷入候選根目錄。
- [x] 建立 static output、`site`／`base`、一個空白頁面的建置與預覽；先禁用安裝腳本，審查並記錄必須單獨執行者。
- [x] 建置成功且 audit 可執行，記錄候選依賴數、Critical／High 清單；此時不保證完整遷移會零警報。

驗證：先以 `npm install --package-lock-only --ignore-scripts` 產生新 lockfile 並審查，再以 `npm ci --ignore-scripts` 重現安裝、執行經審查的必要腳本、`npm run build`、`npm audit --json`；預覽 `/blog/`，根 URL 假成功不算通過。依賴：T1。主要檔案：`package.json`、`package-lock.json`、`astro.config.mjs`、Node 版本檔、最小 page；約 5 檔。

### T3：代表內容 PoC（分成兩個 M 切片）

- [x] T3a：先接 Content Collections 與文章 route／layout，驗證 build-blog 圖片文章與 Vssue 程式碼文章；測 frontmatter 日期、圖片、程式碼 fence language、相對連結及 anchors。
- [x] T3b：驗證 css-box-sizing 的 CodePen 與 raw HTML，再轉換 About；確認無 Vue runtime 也可正常呈現。
- [x] 產出新舊 URL／內容／畫面的對照及 PoC audit，列出所有不相容或尚未實作功能。

驗證：三篇代表文章＋About 直接載入、重新整理、桌面／手機畫面、程式碼與圖片可讀，CodePen 可操作或清楚記錄外部限制。依賴：T2；T3b 接 T3a。主要檔案：T3a 約 collection config、route、layout、2 篇 Markdown；T3b 約 CodePen 文章、About page、相關內容／樣式。

### Gate A：是否繼續 Astro

- [x] 代表內容與 production URL 可保留；不需要重新引入 Vue 2／webpack 4／Vssue。
- [x] 有可解釋的依賴安全結果，沒有尚無處置方案且可觸發的 Critical／High；不明項仍列風險。
- [x] 若需要改網址、犧牲功能或增加重型 runtime，先呈現具體取捨；未通過則停止擴展，提出 Hugo 等備選的最小比較，不同時重寫第二版。

### T4：完成全站內容與外觀（按小切片執行）

- [x] T4a：移入最後一篇日記，完成首頁、標籤索引與單一標籤頁；每切片約 4–5 檔。
- [x] T4b：完成共用 header／footer、介紹頁 CSS、程式碼呈現及已確認必要互動；每切片不超過約 5 檔。保留內容授權文字與既有品牌，不要求像素級複製舊主題。
- [x] T4c：遷移 public assets，驗證 coindesk hash 與 favicon；保留舊測試素材，先確認 `blog/assets/test.html` 是否有公開用途，不因搬移目錄而意外擴大公開範圍。

驗證：四篇正文及 8 個圖片引用、13 個頁面路徑、六個標籤、鍵盤導覽、手機窄畫面；檢查內部連結與 hash anchors。依賴：Gate A。主要檔案：各 page、共用 layout／CSS、必要互動腳本及 public assets。

### T5：訂閱、SEO 與外部整合（各自驗證）

- [x] T5a：實作 RSS、Atom、JSON feed 與 sitemap；共用資料來源，保留文章 GUID／id。約 3 endpoint＋config／helper，超過 5 檔再拆切片。
- [x] T5b：依使用者決策實作留言呈現，驗證 #4 與 #3 的資料可達性；不以「畫面有 widget」代替資料映射驗收。
- [x] T5c：確認 Analytics 是否需要，若需要則配置 GA4 並完成實測；未有 measurement ID 先列未驗證，不將舊 UA ID 當 GA4。外部服務不可用時保留可用 fallback。

驗證：feed JSON／XML 可解析、文章數與 URL 正確、特殊字元正確 escape、canonical 無雙重 base；留言與 Analytics 各自記錄可用／未驗證。依賴：T4；留言／Analytics 的服務設定需對應決策。主要檔案：feed endpoints、Astro config、layout／留言區塊及設定說明。

### T6：移除舊工具鏈並建立建置驗證（分三個 S／M 切片）

- [x] T6a：PoC 通過後，將新配置切換成根目錄唯一建置入口，移除 VuePress／Vue 2／webpack／Vssue 等已替代依賴與舊 `yarn.lock`；檢查新 lockfile 不再解析這些舊鏈。舊內容與資產不得跟著刪除。
- [x] T6b：保留一份最小可重跑 smoke check，驗證路徑、靜態資產 hash、feeds 及 base；補 `README.md` 的安裝／寫作／建置說明，固定 Node/npm。
- [x] T6c：新增 GitHub Actions build／audit／smoke workflow，先不自動 deploy；新增每週 npm 與 Actions 的 Dependabot 檢查，major 更新單獨審查。CI 不使用 `pull_request_target` 執行不可信分支的程式。

驗證：乾淨環境執行 frozen install、build、audit、smoke。安全比較按 GHSA＋套件＋版本正規化，不直接把 Yarn／npm 的不同計數相減。audit 服務失敗列為驗證失敗，不當成零漏洞。依賴：T4、T5；每切片約 2–5 檔，包括 package／lock、README／smoke、`.github/workflows/` 與 `.github/dependabot.yml`。

### Gate B：切換前可交付條件

- [x] 全部內容、必要功能與公開路徑通過；留言、Analytics 決策已記錄，任何功能變動由使用者確認。
- [x] 無未處理且可觸發的 Critical／High；其他警報與未知可觸發性逐項列出，不以框架更新或刪除 lockfile 宣稱安全。目標是清除舊鏈警報，新依賴警報同樣納入驗收。
- [x] 提供可審查 diff、build／audit／瀏覽器證據、待部署 artifact、舊 artifact 與回退步驟；本地完成與遠端完成分開。

### T7：獲授權後切換 GitHub Pages（S／M，remote 階段）

- [x] 取得當前 push／PR／部署授權後才送出 remote 變更；先確認 build-only workflow 通過並停止舊 Travis 自動發布，避免兩個發布者互相覆蓋。封存舊 `gh-pages` commit／產物。
- [x] Pages source 切為 GitHub Actions，啟用受控 deploy job：build 權限以 `contents: read` 為主，deploy 只給必要的 `pages: write`、`id-token: write` 與 environment；鎖定已查證的 action commit。部署來源為預設分支或手動核准，不從 PR 自動上線。
- [x] 上線後實測 production URL 清單、feed、留言連結與 coindesk hash，等待 GitHub 重掃預設分支，再報告 alerts 的實際剩餘數；已移除 `.travis.yml` 並停用 Travis webhook；未讀取或撤銷可能被其他專案共用的舊 token。

驗證：以真正 Actions run／Pages deployment 與線上 HTTP／瀏覽器結果為證據。依賴：Gate B＋remote 授權。主要檔案：workflow、`.travis.yml`、維護文件；遠端設定：Pages source、舊發布服務。不能以本地 build 成功標記 T7 完成。

## 執行補充

- Gate A：Go。代表文章、8 張圖片與 About 可用，不需 Vue／webpack runtime；初次候選的 picomatch 高風險已更新，最終 audit 為 0。
- Gate B：部署後 CodePen 顯示與 CSS 分頁互動通過；Actions 的 Linux build／audit／smoke／deploy 全部成功。
- 三種 feeds 沿用原站摘要型內容；JSON Feed 補上規格所需的 `content_text`。sitemap.xml 作為官方 sitemap index 的相容別名。
- 原 VuePress nprogress 隨 client router 移除；新站是原生多頁導覽，沒有自訂頁面切換進度條。文章閱讀進度使用 CSS scroll timeline，沒有引入動畫 runtime。
- `.travis.yml` 已移除，Travis webhook 已停用，Pages 改用 Actions。

## 回退與風險

- 切換前保留已部署的 `gh-pages` commit 與可重部署產物，不依賴過時 Node 臨時重建舊站。必要時以核准的流程恢復舊 artifact／原 Pages branch source，暫停新 deploy；資料與 issues 不刪除。
- 原版 build 若失敗不阻止內容 PoC，但失去的視覺／行為基準需明示，不能假稱無回歸。
- 新套件數量較少不保證無漏洞；Astro 及新整合仍需持續 audit、更新與實際瀏覽器驗證。
- 新 Content Collections 不可自動把來源年月目錄／檔名當 permalink；重複日期片段、slug 變更、feed GUID 改動都屬回歸。
- Markdown 的 `breaks`、自動 linkify、task lists、程式碼行號等行為要依實際內容驗證；只補網站確有使用的缺口，不把整套舊插件搬回。
- GitHub Pages 無伺服器端 OAuth secret 保管能力；任何新前端 bundle 不可包含 `VSSUE_CLIENT_SECRET` 或部署 token。若發現舊站已有暴露，另案處理憑證輪替，不在紀錄重印值。

## Definition of Done

**先前規劃階段：**新計畫與舊計畫關係清楚、已核對官方版本及 production URL、任務有依賴與驗證、待決功能明列；只寫文件並回讀，不執行實作。

**PoC 完成：**三篇代表文章＋About 在 Astro 靜態輸出與 `/blog/` 子路徑下可用，且具有實際 build／audit／畫面證據，Gate A 有明確 Go／No-Go 結論。

**本地遷移完成：**T4–T6 與 Gate B 通過；只有一套正式工具鏈與 lockfile，舊內容／網址／資產保留，安全及外部服務缺口完整列明。

**正式升級完成：**T7 已獲授權並實際完成，線上回歸通過、舊發布管道已處理、GitHub alerts 重掃結果已確認。未部署或尚未重掃時只能回報對應階段完成，不宣稱警報已關閉。

## 發布授權更新（2026-09-27）

使用者明確授權完成修正後直接部署 GitHub，再驗證 CodePen。以下發布狀態取代前文「未授權」與「不部署」的歷史邊界：改用 Actions Pages、移除 Travis 設定並停用舊 webhook，保留 gh-pages 作回退。線上驗證結果待發布後補齊。

發布證據：[Actions run 36330471645](https://github.com/kengp3/blog/actions/runs/36330471645)，部署 commit `dedabe314c997dd4b0e89e726020edc25abe5f60`。35 個正式檔案 HTTP 200 且與本機 dist bytes 相同；CodePen 範例與 CSS 分頁可操作；GitHub open alerts 0。
