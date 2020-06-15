import { browser } from "webextension-polyfill-ts";
import { Definition } from "../background/index";

// window.addEventListener("click", notifyBackground);

// function notifyBackground(e: Event) {
//   console.log("content-script yo.");
//   const eventTarget = e.target as HTMLAnchorElement;
//   if (eventTarget.tagName != "A") {
//     return;
//   }
//   browser.runtime.sendMessage({ url: eventTarget.href });
// }

function displayDef(def: Definition): void {
  console.log(def);

  const selection: Selection | null = window.getSelection();
  console.log(selection);
}

browser.runtime.onMessage.addListener(displayDef);
