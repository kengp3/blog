---
title: css box-sizing
date: 2020-2-13
tags:
  - programming
  - css
author: Ken
location: Taipei, Taiwan
---

最近再調整 `css` 的時候發現，已經給定了 `width` 跟 `height` 但是顯示的大小卻不是設定的那樣。
後來才發現如果有設定 `margin` 或是 `padding` 時，**大小會再加上邊界跟內距這兩個數值**。但有時候我們希望物件的大小直接就是設定的寬高，就可以使用 `box-sizing`。

以下節錄 [MDN - box-sizing - CSS](https://developer.mozilla.org/zh-TW/docs/Web/CSS/box-sizing)

## 定義

box-sizing 屬性 用於更改預設 CSS 盒子模型 中所計算的寬度和高度。可以使用此屬性來模擬不正確支持 CSS 盒子模型規範的瀏覽器的行為。

## 值

- content-box
  這是根據 CSS 標準的起始值和預設值。 `width` 與 `height` 只包括內容本身的寬和高， 不包括邊框（border）、內邊距（padding）、外邊距（margin）。注意：內邊距、邊框和外邊距都在這個盒子的外部。例如，如果 `.box {width: 350px};` 而且 `{border: 10px solid black;}` ，那麼在瀏覽器中的渲染該容器的實際寬度將是 `370px`;

  簡單來說，尺寸計算公式：

  - **width = 內容的寬度**
  - **height = 內容的高度**

  寬度和高度都不包含內容的邊框（border）和內邊距（padding）。

- border-box
  `width` 和 `height` 屬性包括內容（content），內邊距（padding）和邊框（border），但不包括外邊距（margin）。這是當文檔處於 Quirks 模式時 Internet Explorer 所使用的盒模型。注意，內邊距和邊框都將在盒子內 ，例如，`.box {width: 350px; border: 10px solid black;}` 導致在瀏覽器中呈現的容器寬度為 `350px` 。內容框不能為負，並且進位到 0，使得不可能使用 `border-box` 使元素消失。

  這裡的維度計算為：

  - **width = border + padding + 內容的 width**
  - **height = border + padding + 內容的 height**

## 語法

```css
/* Keyword values */
box-sizing: content-box;
box-sizing: border-box;

/* Global values */
box-sizing: inherit;
box-sizing: initial;
box-sizing: unset;
```

## Examples

<p class="codepen" data-height="370" data-theme-id="dark" data-default-tab="result" data-user="kengp3" data-slug-hash="OJVMPNM" style="height: 370px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="css box-sizing">
  <span>See the Pen <a href="https://codepen.io/kengp3/pen/OJVMPNM">
  css box-sizing</a> by KenGp3 (<a href="https://codepen.io/kengp3">@kengp3</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
