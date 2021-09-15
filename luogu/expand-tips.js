// ==UserScript==
// @name         洛谷 - 自动展开提示
// @namespace    http://tampermonkey.net/
// @version      0
// @description  自动展开提示
// @author       Henry-ZHR
// @match        https://www.luogu.com.cn/problem/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js
// ==/UserScript==

(function() {
  'use strict';
  $.noConflict();
  var count = 0;
  const MAX_COUNT = 100;
  const expandTips = function() {
    ++count;
    if (count > MAX_COUNT) {
      alert("Failed to expand tips.\ncount > " + MAX_COUNT);
      return;
    }
    const elements = document.getElementsByClassName("expand-tip");
    if (elements.length == 0) {
      setTimeout(expandTips, 200);
    } else {
      for (var element of elements) {
        element.childNodes[0].click();
      }
    }
  }
  jQuery(expandTips);
})();
