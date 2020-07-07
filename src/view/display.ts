import { browser } from "webextension-polyfill-ts";
import { Definitions } from "../background/index";

/**
 * TODOS
 * ✔️ Receive (definitions: WordTypes)
 * (2) Place each type+definition into its own containers
 * (3) Determine definition-box dimensions
 *     - Max-content the width and height if possible to do so without hitting window edges
 *       - Else- expand towards the edge(s) and leave buffer(s) of 50px
 *             - enable overflows
 * (4) Determine placement
 *     - Utilize window.innerWidth & window.innerHeight
 *     - Create four placement-helper-functions for dynamic placements around DOMRects (eg. placeBelowRight, placeBelowLeft, placeAboveRight, placeAboveLeft)
 *       - Always call placeBelowRight unless:
 *         - There's no space for the element below - then call placeAboveRight
 *         - There's no space for the element both below and to the right - then call placeAboveLeft
 */

function generateNullFrame(): HTMLDivElement {
  const frame: HTMLDivElement = document.createElement("div");
  frame.className = "null-frame";
  frame.innerText = "No definition found :(";
  frame.style.display = "flex";
  frame.style.justifyContent = "center";
  frame.style.background = "rgba(247, 118, 157, 0.8);";
  /** bookmarked */

  return frame;
}

function generateDefFrame(defs: Definitions): HTMLDivElement {
  /**
   * TODOS (2)
   */
  // Create main container
  const frame: HTMLDivElement = document.createElement("div");
  frame.className = "definitions-frame";

  // Build types-control component
  const typesControl: HTMLDivElement = document.createElement("div");
  const upArrow: HTMLDivElement = document.createElement("div");
  const wordType: HTMLHeadingElement = document.createElement("h1");
  const downArrow: HTMLDivElement = document.createElement("div");
  typesControl.className = "types";
  upArrow.className = "types__up-arrow";
  wordType.className = "types__label";
  downArrow.className = "types__down-arrow";

  // Build definitions component
  const definitions: HTMLDivElement = document.createElement("div");
  const definition: HTMLParagraphElement = document.createElement("p");
  const example: HTMLParagraphElement = document.createElement("p");
  const definitionsControl: HTMLDivElement = document.createElement("div");
  const leftArrow: HTMLDivElement = document.createElement("div");
  const scrollLabel: HTMLParagraphElement = document.createElement("p");
  const rightArrow: HTMLDivElement = document.createElement("div");
  definitions.className = "definitions";
  definition.className = "definitions__definition";
  example.className = "definitions__example";
  definitionsControl.className = "definitions__control";
  leftArrow.className = "definitions__left-arrow";
  scrollLabel.className = "definitions__scroll-label";
  rightArrow.className = "definitions__right-arrow";

  // Compose frame
  typesControl.appendChild(upArrow);
  typesControl.appendChild(wordType);
  typesControl.appendChild(downArrow);
  definitions.appendChild(definition);
  definitions.appendChild(example);
  definitionsControl.appendChild(leftArrow);
  definitionsControl.appendChild(scrollLabel);
  definitionsControl.appendChild(rightArrow);
  definitions.appendChild(definitionsControl);
  frame.appendChild(typesControl);
  frame.appendChild(definitions);

  return frame;
}

browser.runtime.onMessage.addListener((defs) => {
  /**
   * Generate complete frame if definition exists
   * If not- generate default message frame
   */
  console.log(defs);
  let frame: HTMLDivElement;
  if (defs) {
    frame = generateDefFrame(defs);
  } else {
    frame = generateNullFrame();
  }
});
