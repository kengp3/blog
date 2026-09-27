# [Kengp3 Blog](https://kengp3.github.io/blog/)

Hi，這邊是我個人的部落格。  
紀錄工作上遇到的問題，有時寫寫自己有興趣的事！

以 Astro 建置、GitHub Actions 發布至 GitHub Pages 的靜態部落格，支援文章搜尋、標籤、明暗模式與圖片放大。

- [正式網站](https://kengp3.github.io/blog/)
- [建置與部署紀錄](https://github.com/kengp3/blog/actions/workflows/build.yml)
- 訂閱：[RSS](https://kengp3.github.io/blog/rss.xml)／[Atom](https://kengp3.github.io/blog/feed.atom)／[JSON Feed](https://kengp3.github.io/blog/feed.json)

## 開發與驗證

使用 Node 24.21.0 與 npm 11.19.0；版本設定見 `.nvmrc` 與 `package.json`。已安裝 nvm 時：

```sh
nvm install
nvm use
npm ci --ignore-scripts
npm run dev
```

開啟終端顯示的 `/blog/` 網址。正式產物必須另外驗證：

```sh
npm run build
npm test
npm audit --audit-level=low
npm run preview -- --host 127.0.0.1
```

`dist/` 是靜態發布目錄。`.npmrc` 預設禁用套件 lifecycle scripts；macOS ARM64 與 GitHub Actions Linux 的安裝／圖片建置已驗證可在禁用腳本下完成。只使用 npm 與 `package-lock.json`，以 `npm ci` 依鎖定版本安裝。

`npm test` 會檢查建置產物，因此須先 build。涵蓋歷史網址、內部連結與錨點、圖片、canonical、feeds、sitemap、coindesk.json 雜湊與舊依賴移除。

## 寫文章

在 `blog/_posts/<年份>/` 新增 Markdown：

```yaml
---
title: 文章標題
date: "2026-09-27"
permalink: /2026/09/27/article-slug/
description: 一句清楚的摘要。
tags:
  - programming
author: Ken
location: Taipei, Taiwan
---
```

- `date` 必須加引號，使用有效的 `YYYY-MM-DD` 日曆日期；排序不依賴本機時區。
- `permalink` 不含 `/blog`，格式為 `/YYYY/MM/DD/slug/`，不可和其他文章重複。既有 permalink 不隨檔名變更。
- 標籤使用小寫英文字母、數字或連字號；頁面會自動建立。
- 圖片使用相對路徑，例如 `../../assets/example/01.png`；Astro 會處理尺寸與輸出。不要使用 webpack 的 `~@alias`。
- 站內文章連結使用公開路徑，例如 `/blog/2020/02/05/start-blog/`。更動舊標題時保留原 anchor。
- 若已有對應 GitHub issue，可加 `issue: 123`。未指定時顯示手動建立 issue 的入口，不會自動建立或重新開啟 issue。
- Feed 沿用摘要形式，文章完整內容透過連結閱讀；JSON Feed 補上必要的 `content_text`。

## 網站維護

- `src/layouts/Base.astro`：導覽、SEO、搜尋與 footer。
- `src/styles/site.css`：共用色票、字體、手機版、明暗模式與減少動態偏好。
- `src/pages/[...path].astro`：文章與目錄；`src/pages/tag/`：標籤。
- `src/pages/[feed].ts`：三種訂閱格式。官方 sitemap integration 建置後另保留 `/sitemap.xml` 入口。
- `public/`：原樣複製的公開資產；`coindesk.json` 不可意外改寫。
- `blog/assets/test.html` 是原有測試素材，未納入公開網站。

首頁封面是本次產生的編輯式示意圖，不是 CSS 運作圖。Outfit 字體與 Ken 原 GitHub 頭像已自架；字體授權見 `public/fonts/Outfit-OFL.txt`。其他中文使用系統字體。

依使用者決策，留言改用 GitHub Issues 連結，暫不啟用 Analytics。頁面不載入 Vssue、UA 或 GA4。深淺色選擇僅儲存在瀏覽器的 localStorage；CodePen 沿用官方腳本建立外部嵌入，另保留直接開啟連結。

## 發布與回退

[發布 workflow](.github/workflows/build.yml) 執行 `npm ci --ignore-scripts`、audit、build、smoke 並保存 artifact。推送 `master` 後，驗證成功才部署至 GitHub Pages；`codex/**` 推送與 PR 只驗證。也可手動觸發 workflow，只有 `master` 可以部署。Pages 使用 GitHub Actions source，部署 job 僅授予 `pages: write` 與 `id-token: write`。

舊 `.travis.yml` 已移除；切換時停用 Travis webhook，保留既有 `gh-pages` 分支作回退基準。Dependabot 每週檢查 npm 與 Actions，major 更新不併入相容更新群組。

若需回退舊站，先停用新版自動部署，再將 Pages 發布來源切回保留的 `gh-pages` 分支；不要重新啟用過時 Travis 工具鏈。

## 遷移驗證

2026-09-27 已完成 VuePress 1 → Astro 遷移與正式部署：

- Linux CI 的安裝、build、3 組 smoke tests 與 deployment 通過。
- 35 個正式站檔案 HTTP 200，與建置產物一致。
- 當次 `npm audit` 與 GitHub open Dependabot alerts 均為 0；此為驗證時點的結果，後續仍由 CI 與 Dependabot 持續檢查。
- CodePen 沿用舊站官方嵌入方式，正式 HTTPS 頁面顯示與 CSS 分頁操作通過。本地曾出現拒絕連線，不能只憑本地結果判定線上狀態；具體環境差異原因尚未確認。

執行清單見 [升級計畫](docs/plans/blog-framework-upgrade.plan.md)；本次證據、限制與回退資訊見 [遷移驗證紀錄](docs/research/astro-migration.research.md)。
