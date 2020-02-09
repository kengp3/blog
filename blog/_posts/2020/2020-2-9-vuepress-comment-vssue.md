---
title: Vssue - 簡單幫 Vuepress Blog 加上留言功能
date: 2020-2-9
tags:
  - programming
  - javascript
  - vuepress
  - vssue
author: Ken
location: Taipei, Taiwan
---

## [Vssue](https://vssue.js.org/) 簡介

[Vssue](https://vssue.js.org/) 是基於 issue 的留言功能，並且支援很多平台。

- GitHub OAuth App
- GitLab Application
- BitBucket OAuth Consumer
- Gitee Third Party Application
- Gitea Application

這邊就主要是使用 Github 更多資訊可以直接去他的[官方網站](https://vssue.js.org/)看看。

## config vuepress

其實 `@vuepress/theme-blog` 這個官方的 Blog 主題就有整合 [Vssue](https://vssue.js.org/) 所以只需要加入以下設定。

```js
module.exports = {
  theme: '@vuepress/theme-blog',
  themeConfig: {
    comment: {
      service: 'vssue',
      owner: 'OWNER_OF_REPO', // example: kengp3
      repo: 'NAME_OF_REPO', // example: blog
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
    },
  },
};
```

而 `clientId`, `clientSecret` 需要去申請 **[GitHub OAuth App](https://github.com/settings/developers)** 取得。

## 申請 GitHub OAuth App

1. **Settings > Developer settings > OAuth Apps**
   ![goto setting page](~@alias/2020-2-9-vuepress-comment-vssue/01.png)
1. click '**New OAuth App**' > 填寫資料
   ![input](~@alias/2020-2-9-vuepress-comment-vssue/02.png)
1. 申請成功就會看到一組 `clientId`, `clientSecret`
   ![success](~@alias/2020-2-9-vuepress-comment-vssue/03.png)

把它複製到[剛剛的設定檔](#config-vuepress)那邊就可以了。

> 當然 `clientSecret` 最好也是不要直接寫在設定檔之中，建議[設定在 Travis CI 的環境變數](./2020-2-7-build-blog-with-vuepress.md#_2-設定-travis-ci)中。
