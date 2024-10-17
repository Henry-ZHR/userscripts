// ==UserScript==
// @name               中大自动验证码认证
// @name:en            SYSU CAS Auto Captcha Login
// @name:zh            中大自动验证码认证
// @namespace          https://github.com/KumaTea
// @namespace          https://greasyfork.org/en/users/169784-kumatea
// @homepage           https://github.com/KumaTea/SYSU-CAS
// @version            1.2.0.0
// @description        中山大学身份验证系统自动识别验证码登录
// @description:en     Automatic Script for Solving captcha of CAS (Central Authentication Service) of Sun Yat-sen University
// @description:zh     中山大学身份验证系统自动识别验证码登录
// @description:zh-cn  中山大学身份验证系统自动识别验证码登录
// @author             KumaTea
// @match              https://cas.sysu.edu.cn/cas/login*
// @match              https://cas-443.webvpn.sysu.edu.cn/cas/login*
// @license            GPLv3
// @require            https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// @require            https://cdn.jsdelivr.net/npm/sweetalert2@11.3.0/dist/sweetalert2.all.min.js
// ==/UserScript==

const { createWorker } = Tesseract;

/*
为省去手动激活页面的操作
请在此输入您的 NetID 账号密码
此操作不会上传任何信息
*/

const username = '';
const password = '';

/*
Whoa! You found here!
Please replace "tesseract-fastminjs.js" with this link before reading the following instructions:
https://gitee.com/kumatea/tesseract-dist/raw/master/2.1.5/tesseract-fast.min.js

Use fast trained data (1.89 MB) by default.
If you want to use the better trained data (10.4 MB),
replace the "tesseract-fast.min.js" with "tesseract.min.js"
in the '@require' section above.
There is also a best version: "tesseract-best.min.js".

默认使用精简训练数据（1.89 MB）。
如果你想使用标准训练数据（10.4 MB），在上面的 '@require' 部分
把 "tesseract-fast.min.js" 替换为 "tesseract.min.js"。
另有一个最佳版本："tesseract-best.min.js"。
 */


/* jshint esversion: 8 */
// "use strict";


const captcha_regex = /^[A-Za-z0-9]{4}$/g;
const black_threshold = 50;


function react_input(component, value) {
  // Credit: https://github.com/facebook/react/issues/11488#issuecomment-347775628
  let last_value = component.value;
  component.value = value;
  let event = new Event("input", {bubbles: true});
  // React 15
  event.simulated = true;
  // React 16
  let tracker = component._valueTracker;
  if (tracker) {
    tracker.setValue(last_value);
  }
  component.dispatchEvent(event);
}


function replace_color_in_canvas(canvas) {
  let ctx = canvas.getContext("2d");
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;
  let len = data.length / 3;
  let first_pixel_array = [data[0], data[1], data[2]];
  for (let i = 0; i < len; i += 1) {
    let r = data[i * 3];
    let g = data[i * 3 + 1];
    let b = data[i * 3 + 2];
    if (r + g < black_threshold || r + b < black_threshold || g + b < black_threshold) {
      data[i*3] = first_pixel_array[0];
      data[i*3 + 1] = first_pixel_array[1];
      data[i*3 + 2] = first_pixel_array[2];
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return ctx;
}


function img_src_to_base64(img) {
  // Ref: https://stackoverflow.com/a/22172860/10714490
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx = replace_color_in_canvas(ctx.canvas);
  return ctx.canvas.toDataURL("image/png");
}


function clone_image(img) {
  let new_img = document.createElement("img");
  new_img.src = img_src_to_base64(img)
  return new_img;
}


async function recognize() {
  const worker = await createWorker('eng');
  let img = document.getElementById('captchaImg');
  await img.decode();
  let { data: { text } } = await worker.recognize(clone_image(img));
  return text.trim();
}

async function solve() {
  if (document.getElementById("captcha")) {
    react_input(document.getElementById("captcha"), "Loading...");

    let result = await recognize();
    react_input(document.getElementById("captcha"), result);

    if (!result.match(captcha_regex)) {
      if (window.confirm("Captcha seems incorrect:" + result + "\nReload?")) {
        location.reload();
      }
    }

    console.log("Submitting: " + result);

    // document.querySelector("input.btn.btn-submit.btn-block").click();
  }
}

solve();
