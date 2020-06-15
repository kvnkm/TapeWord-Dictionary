import { browser } from "webextension-polyfill-ts";
import { Definition } from "../background/index";

function displayDef(def: Definition): void {
  console.log(def);
  console.log(
    "------------------------------------------------------------------------"
  );

  const selection: Selection | null = window.getSelection();
  console.log(selection);
  console.log("Anchor node");
  console.log(selection?.anchorNode);
  console.log("Anchor offset");
  console.log(selection?.anchorOffset);
  console.log("Range count");
  console.log(selection?.rangeCount);
  console.log("Get bounding client rect");
  console.log(selection?.getRangeAt(0).getBoundingClientRect());
}

browser.runtime.onMessage.addListener(displayDef);
