import { browser } from "webextension-polyfill-ts";
import { Definitions, Definition, State } from "../types";
import { render, upArrow, downArrow, leftArrow, rightArrow } from "./utils";
import { frameStyles } from "./css";

/**
 * FLOW
 * (1) Create message receiver  (defs: Definitions)
 *     ✔️ inject styling into DOM
 *     - if defs is empty
 *       ✔️ inject nullFrame = generateNullFrame() into DOM
 *       - add externalClick() handler to DOM
 *       - return
 *     ✔️ set state with defs
 *     - skeleton = generateSkeleton() - FIXME - add animation classes to .main-frame, .types, .definitions
 *     - frame = populateElement(element: HTMLElement, definitions: Definitions) - switch (element.className)
 *                                                                                 - case "-_WORDSTAR_-main-frame"
 *                                                                                 - case "definitions"
 *     - execute first render with state
 *       - render(element: HTMLElement) - switch (element.className)
 *                                        - case "-_WORDSTAR_-main-frame"
 *                                          - body:HTMLBodyElement.appendChild(frame)
 *                                          - add button-event listeners
 * (2) Listen for button clicks
 *     - handleTypeChange(e: Event): void // Update div.types & div.definitions on upArrow & downArrow clicks
 *       - state = setState(state: State, action: Action): State - switch (action)
 *                                                                 - cases "PREVIOUS_WORDTYPE", "NEXT_WORDTYPE"
 *       - setAnimationClasses(elements: HTMLElement[]) - FIXME
 *       - typesEl = populateElement(element: HTMLElement, definitions: Definitions) - switch (element.className)
 *                                                                                     - case "types"
 *       - definitionEl = populateElement(element: HTMLElement, definitions: Definitions) - switch (element.className)
 *                                                                                          - case "definitions"
 *                                                                                          - include logic for both def & example nodes
 *       - render(typesEl) - switch (element.className)
 *                           - case "types"
 *                             - div.-_WORDSTAR_-main-frame:HTMLDivElement.appendChild(typesEl)
 *       - render(definitionEl) - switch (element.className)
 *                                - case "definitions"
 *                                  - div.-_WORDSTAR_-main-frame:HTMLDivElement.appendChild(definitionEl)
 *     - handleDefChange(e: Event): void // Update div.definitions leftArrow & rightArrow clicks
 *       - state = setState(state: State, action: Action): State - switch (action)
 *                                                                 - cases "PREVIOUS_DEFINITION", "NEXT_DEFINITION"
 *       - setAnimationClasses(elements: HTMLElement[]) - FIXME
 *       - definitionEl = populateElement(element: HTMLElement, definitions: Definitions) - switch (element.className)
 *                                                                                          - case "definitions"
 *       - render(definitionEl) - switch (element.className)
 *                                - case "definitions"
 *                                  - div.-_WORDSTAR_-main-frame:HTMLDivElement.appendChild(definitionEl)
 * () Determine definition-box dimensions
 *     - Max-content the width and height if possible to do so without hitting window edges
 *       - Else- expand towards the edge(s) and leave buffer(s) of 50px
 *             - enable overflows
 * () Determine placement
 *     - Utilize window.innerWidth & window.innerHeight
 *     - Create four placement-helper-functions for dynamic placements around DOMRects (eg. placeBelowRight, placeBelowLeft, placeAboveRight, placeAboveLeft)
 *       - Always call placeBelowRight unless:
 *         - There's no space for the element below - then call placeAboveRight
 *         - There's no space for the element both below and to the right - then call placeAboveLeft
 */

let state: State;
export function getState() {
  return state;
}

function renderErrorFrame(body: HTMLBodyElement) {
  const nullFrame: HTMLDivElement = generateNullFrame();
  body.appendChild(nullFrame);
}

function injectStyling(css: string, head: HTMLElement): void {
  const style: HTMLStyleElement = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}

function generateNullFrame(): HTMLDivElement {
  const nullFrame: HTMLDivElement = document.createElement("div");
  const nullMessage: HTMLParagraphElement = document.createElement("p");
  nullFrame.className = "-_WORDSTAR_-null-frame";
  nullMessage.className = "-_WORDSTAR_-null-frame__message";
  nullMessage.innerText = "No definition found :(";
  nullFrame.appendChild(nullMessage);
  return nullFrame;
}

function generateSkeleton(): HTMLDivElement {
  // Create main container
  const frame: HTMLDivElement = document.createElement("div");
  frame.className = "-_WORDSTAR_-main-frame";

  // Build types-control component
  const typesContainer: HTMLDivElement = document.createElement("div");
  const upArrowContainer: HTMLButtonElement = document.createElement("button");
  const wordType: HTMLHeadingElement = document.createElement("h1");
  const downArrowContainer: HTMLButtonElement = document.createElement(
    "button"
  );
  typesContainer.className = "types";
  upArrowContainer.className = "types__up-arrow";
  upArrowContainer.id = "upArrowContainer";
  wordType.className = "types__label";
  downArrowContainer.className = "types__down-arrow";
  downArrowContainer.id = "downArrowContainer";
  upArrowContainer.appendChild(upArrow);
  downArrowContainer.appendChild(downArrow);
  typesContainer.appendChild(upArrowContainer);
  typesContainer.appendChild(wordType);
  typesContainer.appendChild(downArrowContainer);

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
  leftArrowContainer.id = "leftArrowContainer";
  rightArrowContainer.className = "definitions__right-arrow";
  rightArrowContainer.id = "rightArrowContainer";
  definitions.appendChild(definition);
  definitions.appendChild(example);
  leftArrowContainer.appendChild(leftArrow);
  rightArrowContainer.appendChild(rightArrow);
  definitionsControl.appendChild(leftArrowContainer);
  definitionsControl.appendChild(rightArrowContainer);
  definitions.appendChild(definitionsControl);

  // Compose frame
  frame.appendChild(typesContainer);
  frame.appendChild(definitions);

  return frame;
}

function populateFrame(
  frameSkeleton: HTMLDivElement,
  definitions: Definitions
) {
  //
  const frame: HTMLDivElement = frameSkeleton.cloneNode(true) as HTMLDivElement;
  const [wordType]: string[] = Object.keys(definitions);
  const defObj: Definition = definitions[wordType].defs[0];
  const def: string = defObj.def;
  const example: string = defObj.example;
  const wordTypeEl: HTMLHeadingElement = frame.querySelectorAll(
    "h1.types__label"
  )[0] as HTMLHeadingElement;
  const defEl: HTMLParagraphElement = frame.querySelectorAll(
    "p.definitions__definition"
  )[0] as HTMLParagraphElement;
  const exampleEl: HTMLParagraphElement = frame.querySelectorAll(
    "p.definitions__example"
  )[0] as HTMLParagraphElement;
  wordTypeEl.innerText = wordType;
  defEl.innerText = def;
  exampleEl.innerText = example;

  return frame;
}

browser.runtime.onMessage.addListener((defs) => {
  // Get body & head elements
  const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
  const head: HTMLHeadElement = document.getElementsByTagName("head")[0];

  // Inject styling into DOM
  injectStyling(frameStyles, head);

  if (!defs) {
    renderErrorFrame(body);
  } else {
    // Set state and retrieve first set of defs
    state = defs;
    console.log(state);
    const definitions: Definitions = state[0];

    // Generate and populate frame based on state
    const frameSkeleton: HTMLDivElement = generateSkeleton();
    const frame: HTMLDivElement = populateFrame(frameSkeleton, definitions);

    // Execute first render
    render(frame);
  }
});
