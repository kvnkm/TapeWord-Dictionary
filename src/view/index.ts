import { browser } from "webextension-polyfill-ts";
import { Definitions, Definition, State } from "../types";
import { render } from "./utils";
import { typesContainer, definitionsContainer } from "./components";
import frameStyles from "./styles/frame.css";
import typeStyles from "./styles/types.css";
import defStyles from "./styles/definitions.css";

/*
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

// FIXME - Bypass Github's external-fonts-blocking CSP

browser.runtime.onMessage.addListener((defs) => {
  // Get body & head elements
  const body: HTMLBodyElement = document.getElementsByTagName("body")[0];

  if (!defs) {
    renderErrorFrame(body);

    /** Track mouse-down to enable user to begin a click
     * (mousedown) inside a frame, drag, and finish the click
     * (mouseup) outside the frame without frame deletion */
    document.addEventListener("mousedown", handleMouseEvents);
    document.addEventListener("mouseup", handleMouseEvents);
  } else {
    // Set state and retrieve first set of defs
    state = defs;
    const definitions: Definitions = state[0];
    // Generate and populate frame based on state: Event
    const frameSkeleton: HTMLDivElement = generateSkeleton(
      typesContainer,
      definitionsContainer
    );

    const frame: HTMLDivElement = populateFrame(frameSkeleton, definitions);
    // Execute first render
    render(frame);
    document.addEventListener("mousedown", handleMouseEvents);
    document.addEventListener("mouseup", handleMouseEvents);
  }
});

/**
██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗     ███████╗██╗   ██╗███╗   ██╗ ██████╗███████╗
██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║   ██║████╗  ██║██╔════╝██╔════╝
███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝    █████╗  ██║   ██║██╔██╗ ██║██║     ███████╗
██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗    ██╔══╝  ██║   ██║██║╚██╗██║██║     ╚════██║
██║  ██║███████╗███████╗██║     ███████╗██║  ██║    ██║     ╚██████╔╝██║ ╚████║╚██████╗███████║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝                                                                                        
 */

// FIXME - Modularize state
let state: State;
export function getState() {
  return state;
}

// Declare mouse-down tracker
let isPointerDragged: boolean = false;

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
  nullFrame.className = frameStyles.nullFrame;
  nullMessage.innerText = "No definition found :(";
  nullFrame.appendChild(nullMessage);
  return nullFrame;
}

function generateSkeleton(
  typesContainer: HTMLDivElement,
  definitionsContainer: HTMLDivElement
): HTMLDivElement {
  const frame: HTMLDivElement = document.createElement("div");
  frame.className = frameStyles.defFrame;
  frame.id = "W_O_R_D_STAR";

  frame.appendChild(typesContainer);
  frame.appendChild(definitionsContainer);

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
  const wordTypeEl: HTMLHeadingElement = frame.getElementsByClassName(
    typeStyles.typesLabel
  )[0] as HTMLHeadingElement;
  const defEl: HTMLParagraphElement = frame.getElementsByClassName(
    defStyles.definition
  )[0] as HTMLParagraphElement;
  const exampleEl: HTMLParagraphElement = frame.getElementsByClassName(
    defStyles.example
  )[0] as HTMLParagraphElement;
  wordTypeEl.innerText = wordType;
  defEl.innerText = def;
  exampleEl.innerText = example ? "e.g. " + example : "";

  return frame;
}

function handleMouseEvents(e: Event) {
  const eventType: string = e.type;
  const targetEl: EventTarget = e.target!;
  const hasWSFrame: HTMLElement | null = (targetEl as HTMLElement).closest(
    "." + frameStyles.frame
  );

  switch (eventType) {
    case "mousedown":
      hasWSFrame && (isPointerDragged = true);
      break;

    case "mouseup": {
      if (!hasWSFrame && !isPointerDragged) {
        const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
        const frame: HTMLElement = document.getElementsByClassName(
          frameStyles.frame
        )[0] as HTMLElement;
        body.removeChild(frame);
      } else {
        isPointerDragged = false;
      }
    }
    default:
      throw new Error("WORDSTAR Error: Could not handle mouse event");
  }
}
