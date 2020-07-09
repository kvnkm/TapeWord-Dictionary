import { browser } from "webextension-polyfill-ts";
import { Definitions, Definition, Styles } from "../types";
import { styles } from "./css";
import { upArrow, downArrow, leftArrow, rightArrow } from "./utils/ArrowButton";

/**
 * TODOS
 * ✅ Receive (defs: Definitions)
 * ✅ Create render function
 *     ✔️ Take the first wordType in the state array
 *     ✔️ Generate frame skeleton
 *     ✔️ Populate the frame
 *     ✔️ Configure stying
 * ✅ Insert into DOM
 * (4) Implement types & defs cycling
 *     ✔️ Add button SVGs
 *       ✔️ Refactor within generateFrame
 *       ✔️ Create button element with nested SVG element
 *       ✔️ Configure css
 *     - Implement Redux
 *       - Refactor main listener - create store from msg
 *                                - get state and pass state to populateFrame
 *       - Refactor populateFrame to grab data from the store
 * (5) Determine definition-box dimensions
 *     - Max-content the width and height if possible to do so without hitting window edges
 *       - Else- expand towards the edge(s) and leave buffer(s) of 50px
 *             - enable overflows
 * (6) Determine placement
 *     - Utilize window.innerWidth & window.innerHeight
 *     - Create four placement-helper-functions for dynamic placements around DOMRects (eg. placeBelowRight, placeBelowLeft, placeAboveRight, placeAboveLeft)
 *       - Always call placeBelowRight unless:
 *         - There's no space for the element below - then call placeAboveRight
 *         - There's no space for the element both below and to the right - then call placeAboveLeft
 */

function parseStyles(styles: Styles): string {
  const rulesArray: string[] = Object.keys(styles).map((s) => {
    const selector: string = s;
    const declarationsArray: string[] = Object.keys(styles[selector]).map(
      (property) => property + ":" + styles[selector][property]
    );
    return s + " {" + declarationsArray.join(" ") + "}";
  });
  const css: string = rulesArray.join(" ");
  return css;
}

function injectStyling(css: string): void {
  const head: HTMLHeadElement = document.head;
  const style: HTMLStyleElement = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}

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

function generateFrame(defs: Definitions | null): HTMLDivElement {
  // Create main container
  const frame: HTMLDivElement = document.createElement("div");
  frame.className = "-_WORDSTAR_-main-frame";

  // Return error frame if state is empty
  if (!defs) {
    const errorLabel: HTMLParagraphElement = document.createElement("p");
    errorLabel.className = "-_WORDSTAR_-error-message";
    frame.appendChild(errorLabel);
    return frame;
  }

  // Build types-control component
  const typesControl: HTMLDivElement = document.createElement("div");
  const upArrowContainer: HTMLButtonElement = document.createElement("button");
  const wordType: HTMLHeadingElement = document.createElement("h1");
  const downArrowContainer: HTMLButtonElement = document.createElement(
    "button"
  );
  typesControl.className = "types";
  upArrowContainer.className = "types__up-arrow";
  wordType.className = "types__label";
  downArrowContainer.className = "types__down-arrow";
  upArrowContainer.appendChild(upArrow);
  downArrowContainer.appendChild(downArrow);
  typesControl.appendChild(upArrowContainer);
  typesControl.appendChild(wordType);
  typesControl.appendChild(downArrowContainer);

  // Build definitions component
  const definitions: HTMLDivElement = document.createElement("div");
  const definition: HTMLParagraphElement = document.createElement("p");
  const example: HTMLParagraphElement = document.createElement("p");
  const definitionsControl: HTMLDivElement = document.createElement("div");
  const leftArrowContainer: HTMLButtonElement = document.createElement(
    "button"
  );
  const rightArrowContainer: HTMLButtonElement = document.createElement(
    "button"
  );
  definitions.className = "definitions";
  definition.className = "definitions__definition";
  example.className = "definitions__example";
  definitionsControl.className = "definitions__control";
  leftArrowContainer.className = "definitions__left-arrow";
  rightArrowContainer.className = "definitions__right-arrow";
  definitions.appendChild(definition);
  definitions.appendChild(example);
  leftArrowContainer.appendChild(leftArrow);
  rightArrowContainer.appendChild(rightArrow);
  definitionsControl.appendChild(leftArrowContainer);
  definitionsControl.appendChild(rightArrowContainer);
  definitions.appendChild(definitionsControl);

  // Compose frame
  frame.appendChild(typesControl);
  frame.appendChild(definitions);

  return frame;
}

function populateFrame(
  frameSkeleton: HTMLDivElement,
  currentTypesData: Definitions
) {
  //
  const frame: HTMLDivElement = frameSkeleton.cloneNode(true) as HTMLDivElement;
  const [wordType]: string[] = Object.keys(currentTypesData);
  const defObj: Definition = currentTypesData[wordType].defs[0];
  const def: string = defObj.def;
  const example: string = defObj.example;
  const wordTypeEl: HTMLHeadingElement = frame.querySelectorAll(
    "h1.types__label"
  )[0] as HTMLHeadingElement;
  const defEl: HTMLParagraphElement = frame.querySelectorAll(
    "p.definitions__definition"
  )[0] as HTMLParagraphElement;
  wordTypeEl.innerText = def;
  defEl.innerText = example;

  return frame;
}

browser.runtime.onMessage.addListener((defs) => {
  // Inject styling into DOM
  injectStyling(parseStyles(styles));

  // Retrieve state
  const currentTypesData: Definitions = defs[0];

  // Generate frame based on state
  const frameSkeleton: HTMLDivElement = generateFrame(currentTypesData);

  // Populate frame based on state
  const plainFrame: HTMLDivElement = populateFrame(
    frameSkeleton,
    currentTypesData
  );

  // Inject frame into DOM
  const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
  body.appendChild(plainFrame);
});
