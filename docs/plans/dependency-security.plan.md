# 部落格依賴安全修補與遷移判斷計畫

狀態：原方案保留，尚未執行；2026-09-27 依使用者提供的框架研究，執行主線改為 [Astro 升級計畫](./blog-framework-upgrade.plan.md)。以下相容修補任務不再預設先行執行，僅供短期修補或回退評估。建立日期：2026-09-27（Asia/Taipei）。

## Objective

在隔離環境重現現況建置，以最小相容升級降低已知依賴漏洞，保留文章、網址、外觀與功能；用剩餘漏洞及驗證結果決定繼續修補或另案遷移。警報減少與實際風險降低分開驗收，不以隱藏通知作為完成條件。

## Background

- 專案根目錄：`/Users/kengp3/Workspaces/mine/blog`。
- 本次基準 HEAD：`0ef11cea2b7fd78e9b6cc535488df1515223d1b4`；working tree 在規劃前乾淨。
- VuePress 1.8.2、Vue 2.6.14、webpack 4.46.0；Yarn v1 格式 lockfile，CI 使用 `yarn install`、`yarn build`。尚未指定 Node 與 Yarn 的固定版本。
- 4 篇文章、About 頁、標籤導覽；GitHub Pages base 為 `/blog/`。設定含 Vssue、Google Analytics、feed、sitemap、圖片縮放及閱讀進度。
- 最近提交新增 `blog/.vuepress/public/coindesk.json`，須保留內容及公開路徑。
- 2026-09-27 22:11（Asia/Taipei）透過 GitHub API 分頁查詢：142 個 open alerts、67 個套件，全部指向 `yarn.lock`；Critical 13、High 62、Medium 48、Low 19。
- 6 個警報的 `first_patched_version` 為空：`elliptic`、`vue-template-compiler`、`ip`、`html-minifier`、`lodash.template`、`request`。這是該次 GitHub 公告資料，並非已證明所有版本或替代方案均無修補。
- 尚未執行現況 build、原生 Yarn audit 或逐項可觸發性驗證。前次環境檢查顯示沒有 Yarn 與 `node_modules`；執行時重新確認。

## Materials

| 材料 | 用途 |
| --- | --- |
| `package.json`、`yarn.lock` | 直接依賴、解析版本與傳遞依賴路徑 |
| `blog/.vuepress/config.js`、`blog/.vuepress/components/About.vue`、`blog/.vuepress/styles/` | 設定、外觀及實際使用功能 |
| `blog/_posts/`、`blog/about/`、`blog/assets/`、`blog/.vuepress/public/` | 內容與資產保留基準 |
| `.travis.yml` | 建置與部署設定；不代表遠端 CI 目前仍可用 |
| `project-setting.md` | 文件命名與位置規範 |
| [Dependabot alerts](https://github.com/kengp3/blog/security/dependabot) | 遠端預設分支的實際警報；需具備讀取權限 |
| [Vue 2 EOL](https://v2.vuejs.org/eol/) | 維護狀態，Vue 2 已於 2023-12-31 結束官方維護 |
| [Babel 公告](https://github.com/advisories/GHSA-67hx-6x53-jw92)、[Vue compiler 公告](https://github.com/advisories/GHSA-g3ch-rx76-35fx) | 漏洞觸發條件與修補限制的代表案例 |

### 本次檔案 SHA-256

```text
package.json: 68a62ffea273bb88be885347f5274aa8fe2fedf6ebd65279cd38a2efa5b59a4e
yarn.lock: abff7aee4e3193cd424a37a4902b8f809ea92dc082a4b2299d78958fb966391c
blog/.vuepress/public/coindesk.json: 72df8073667580be5ad6e19c6d0c752a0dfa2fe0f9a63ed1a58231ea8646c0db
```

## Boundaries

- 本次只建立此計畫，不安裝套件、不啟動網站、不修改程式、依賴或 CI。
- 後續執行以隔離 checkout 進行；先用 worktree 工具檢查可重用工作區，無適合者才建立 managed worktree。從已確認的本機 HEAD 開始，避免工具預設遠端分支漏掉未推送提交；分支名稱建議 `codex/dependency-security`。
- 不自動改框架、換留言服務、移除既有功能、重設文章網址或改版外觀。若需要這些變更，先提出具體選項與影響，另行決定。
- 不執行 `audit fix --force`，不直接手改 lockfile，不為了讓數字歸零而 dismiss 警報；不將套件改列 `devDependencies` 當成修補。
- commit、push、PR、部署及 GitHub 設定變更不屬於本次規劃授權。執行驗證不發表留言、不自動登入 OAuth 或修改既有 issues。
- 文件遵循專案規範。本檔同時作為唯一任務清單，取代 skill 預設的 `tasks/plan.md`、`tasks/todo.md`；避免維護重複進度。
- 後續調查報告使用 `docs/research/dependency-security.research.md`；建立前檢查是否已存在。原始命令輸出先放隔離環境的暫存位置，報告收錄必要證據、時間、commit、版本與雜湊，不提交 secrets 或整份建置產物。

## Assumptions

- 以目前 GitHub Pages 靜態部署方式為基準；本機 dev server 及 CI 也是需要評估的攻擊面。
- 現有內容、功能與 public assets 預設保留。未設定憑證的外部服務可列「未驗證」，不能當作通過或擅自移除。
- 優先保留 Yarn 與既有建置方式，不把 package manager／CI 平台遷移混入相容修補。
- 具體 Node、Yarn 及套件目標版本於執行時查證官方支援、公告及 registry 後固定；此計畫不預先指定未驗證的版本。

## 依賴關係與執行順序

```text
T1 隔離與漏洞基準 → T2 現況建置 → 檢查點 A
→ T3 相容修補（每一依賴家族重複驗證） → T4 完整回歸 → 檢查點 B
→ T5 修補或遷移結論
```

已知主要路徑：`VuePress → core → Babel / webpack / dev-server / Vue compiler`；`theme-blog → plugin-blog → Vssue → Axios`。前者跨建置與開發環境，後者涉及訪客端留言；不能直接用 GitHub 的 runtime/development 標籤判斷漏洞是否可觸發。

### T1：建立隔離環境與可比較的漏洞基準

- [ ] 記錄執行時 HEAD、working tree、lockfile hash、Node/Yarn 版本及 GitHub 預設分支；若與本計畫不同，先說明差異與受影響項目。
- [ ] 分頁讀取全部 open alerts，按「套件＋GHSA＋受影響版本」整理；列出直接依賴來源、修補版本、使用階段及可觸發性證據。Critical／High 與無修補版本優先；不明者明確標記待查。
- [ ] 建立隔離 checkout；套件安裝先禁用 lifecycle scripts，核對必要腳本內容後只執行所需項目，不把整批腳本預設為可信。

驗證：核對 API 分頁總數及嚴重程度加總；隔離 checkout 的基準檔 hash 與來源相符。以原生 `yarn audit --json` 檢查鎖定依賴，使用符合確定 Yarn 版本的指令；audit 非零退出碼須區分漏洞與網路／服務錯誤。

依賴：無。預計持久變更：調查報告（S，1 個檔案）；工具與暫存資料只留隔離環境。

### T2：重現現況 build 與功能基準

- [ ] 用固定版本 Yarn 執行 `yarn install --frozen-lockfile --ignore-scripts`，確認 lockfile 未變；記錄任何必需的個別安裝腳本。
- [ ] 執行 `yarn build`，記錄退出碼及環境；建置失敗則先確認是否 Node/OpenSSL、依賴安裝或原有程式問題，不將失敗基準寫成已通過。
- [ ] 以 `/blog/` 子路徑提供靜態產物，記錄文章、About、標籤、feed/sitemap、資產的真實輸出網址與畫面，供 T4 比較。

驗證：記錄完整 build 結果及輸出路徑；確認首頁與至少一篇文章可直接開啟。優先用仍受支援的 Node；如原版僅能在 EOL Node 重現，只用於不含正式憑證的隔離診斷，不作交付環境。若無法安全重現，記錄阻礙並轉入 T5，不無限試版本。

依賴：T1。預計持久變更：調查報告（S，1 個檔案）；不修改原始內容來製造綠燈。

### 檢查點 A：是否具備相容修補基準

- [ ] 現況 build／功能有可比較的證據，或已有足以說明無法重現的根因。
- [ ] Critical／High 的使用階段、未知項及初步修補候選已列明。

有基準即進入 T3；若必須先改框架、移除功能或使用不受支援的交付環境，先交付 T5 的判斷。

### T3：依來源分批進行相容修補

- [ ] 先查各修補版本的公告、changelog 及相容範圍。以一個直接依賴或緊密相關家族為一批，優先處理可觸發的 Critical／High；所有變更可單獨回退。
- [ ] 優先使用上游支援的升級與 package manager 重新解析。只有在相容性可證明時才考慮小範圍 `resolutions`，記錄原因、受影響父套件及移除條件；不強行跨越父套件支援的 major。
- [ ] 每批完成 frozen install、build 與相關功能 smoke check，再比對 audit。失敗只回退本批修改，保留先前通過的成果；不順手移除重複插件或重構網站。

驗證：每批列明舊／新版本、套件來源與 lockfile diff、修補的 GHSA、新增或殘留警報及測試結果。安裝腳本政策延續 T1。

依賴：檢查點 A 通過。預計變更：`package.json`、`yarn.lock`、必要的 VuePress 設定與報告（每批 M，最多約 4 個檔案）。

停止條件：剩餘問題需要替換 VuePress 1／Vue 2 核心鏈、已無可用修補、或相容性必須靠多項跨 major 覆寫維持時，停止該路徑並進入 T5。不得宣稱少量 patch 可以保證消除全部 142 個警報。

### T4：驗證修補後的網站與可重現性

- [ ] 從候選版本作一次乾淨 frozen install 與 build，固定實際驗證通過的 Node/Yarn 版本；以最少設定更新 CI 的版本與 lockfile 保護，不更換 CI 平台。
- [ ] 依下表完成實際瀏覽器回歸與靜態資產檢查；新增一份最小可重跑 smoke check，沿用可用工具，不為此引入完整測試框架。
- [ ] 在相同 audit 來源及相近時間重新取得安全結果，區分「升級造成的變化」與「新公告造成的變化」。所有 Critical／High 都有處理結論，不明的可觸發性不能標成無風險。

| 情境 | 驗收證據 |
| --- | --- |
| `/blog/` 首頁、標籤列表 | 可開啟、導覽正常、4 篇文章可達；首頁與文章的桌面／手機畫面比較 |
| 4 篇文章、About | 既有網址直接載入與重新整理正常；文字、圖片、程式碼區塊及版面無非預期變化 |
| 圖片縮放、閱讀進度、平滑捲動 | 操作結果與基準一致；無新增相關 console error |
| feed、sitemap | 依 T2 實際路徑可取得，文章連結與 `/blog/` base 正確 |
| favicon、文章圖片 | 本地資產回應成功；8 個既有文章圖片引用仍有效 |
| `/blog/coindesk.json` | 可解析 JSON，來源與產物內容一致，且與基準 hash 相同 |
| Vssue、Analytics、CodePen 等外部整合 | 核對配置與載入；缺少服務權限／憑證時標明驗證缺口，登入、留言與服務寫入另行授權 |

驗證：`yarn install --frozen-lockfile --ignore-scripts`、經審查的必要腳本、`yarn build`、`yarn audit --json`；記錄 smoke check 的實際可重跑命令。新增檢查檔前遵循所在目錄規範。

依賴：T3 候選版本。預計變更：`package.json`、`.travis.yml`、一份最小 smoke check、調查報告（M，約 4 個檔案）。遠端 CI 與部署仍未驗證，不能以本地成功代替。

### 檢查點 B：是否可交付相容修補

- [ ] build 與必要功能通過；外部整合缺口明確列出。
- [ ] 沒有未處理且可觸發的 Critical／High；任何暫緩項目均有證據、理由、責任人及具體複查日期，風險接受須由使用者決定。

### T5：交付修補結果與遷移判斷

- [ ] 報告列出基準／候選 commit 或 diff hash、環境版本、已修補／剩餘／未知警報、功能結果與回退方式；若 T2 或 T3 中止，標示受阻，不能稱修補完成。
- [ ] 若相容修補可接受，提供最小差異與維護建議；若核心鏈仍阻塞，只比較「維持現況並接受明確風險」與「遷移受維護的靜態網站方案」，提出一個有證據的推薦，不直接實作遷移。
- [ ] 遷移評估必須涵蓋文章及網址保留、標籤、About、public JSON、feed/sitemap、留言資料與功能、外觀工作量、部署和新依賴的安全狀態。選定方案後再拆獨立計畫。

驗證：報告每個結論可追溯到命令、輸出、公告或瀏覽器證據；保留清楚的下一步與未完成項目。

依賴：T4，或 T2／T3 的停止條件。預計變更：調查報告及本計畫進度（S，2 個檔案）。

## 風險、限制與回退

- GitHub alerts 針對遠端預設分支，本地未推送修補不會讓它即時消失；本地結果與遠端關閉狀態分開回報。未來獲授權推送／合併後，再確認重新掃描結果。
- Yarn audit 服務失敗時保留錯誤，改用可用的公告資料逐版本比對；列出涵蓋差異，不把失敗解讀為零漏洞，不為 audit 擅自換 lockfile 格式。
- 靜態網站降低部分 Node 服務端漏洞的線上可觸發性，但建置憑證、開發伺服器及訪客端依賴仍須各自評估。
- 使用空值或測試設定建立基準；不得把 CI secrets 輸出至紀錄。Vssue 的環境變數來源不等於產物保密保證，若使用正式憑證，須先檢查是否會進入前端 bundle。
- 每批保留 diff 與驗證資料；回退僅撤銷該批變更。未經授權不執行 reset、刪除既有工作或覆蓋其他人的修改。部署回退另行規劃，基準環境不可因回退而重新被標成安全。

## Definition of Done

**本次規劃完成條件：**文件符合 `project-setting.md`、任務具備依賴與驗證、停止條件及範圍明確，回讀確認沒有覆寫既有文件；交付後停止，不開始執行。

**後續調查完成條件：**取得可重現的 build／失敗根因、可比較的安全結果、功能證據及修補或遷移決策材料。調查完成不等於網站安全修補完成。

**安全修補完成條件：**候選版本在可支援環境中通過乾淨建置與回歸；可觸發的 Critical／High 已修補，其餘項目具備明確處置；受阻、未知或未接受的風險仍列未完成。若目標進一步要求 GitHub 警報全部歸零，需所有剩餘依賴具備修補／替代路徑，並於獲授權的遠端更新後確認，不在本計畫中預先保證。
