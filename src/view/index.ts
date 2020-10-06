import { browser } from "webextension-polyfill-ts";
import { Definitions, Definition, Quadrant, State } from "../types";
import {
  render,
  addButtons,
  handleArrows,
  handleAlignment,
  placeFrame,
} from "./utils";
import * as Components from "./components";
import frameStyles from "./styles/frame.css";
import typeStyles from "./styles/types.css";
import defStyles from "./styles/definitions.css";

/**
 * STRETCH FEATS
 *
 * Audio pronunciations
 * Animations
 * Frosted-glass effect on frame
 */

/**
 * FIXME
 *
 * (Open a fresh page by clicking a link), (Define gibberish) - Null frame will not disappear on external-click, error states that "textContainer is undefined"
 */

let selectionBox: DOMRect | undefined = undefined;
let state: State = [];
let quadrant: Quadrant | null = null;
let isPointerDragged: boolean = false;

browser.runtime.onMessage.addListener((msg) => {
  if (msg === "getSelectionBox") {
    selectionBox = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
  } else {
    // Calculate max-width based on quadrant
    quadrant = calcQuadrant(selectionBox!);
    const maxWidth: number = getMaxWidth(quadrant, selectionBox!);

    if (!msg) {
      // Render error frame if term not found
      const nullFrame: HTMLElement = generateNullFrame();
      placeFrame(nullFrame, selectionBox!, quadrant);

      document.addEventListener("mousedown", handleMouseEvents);
      document.addEventListener("mouseup", handleMouseEvents);
    } else {
      // Add msg-array to state-array
      state.push(msg);
      const definitions: Definitions = state[state.length - 1][0];

      // Generate and populate frame based on state
      const frameSkeleton: HTMLElement = createFrame(
        state,
        Components,
        quadrant,
        maxWidth
      );
      const frame: HTMLElement = populateFrame(frameSkeleton, definitions);

      // Execute first render
      render(frame, selectionBox, quadrant);

      document.addEventListener("mousedown", handleMouseEvents);
      document.addEventListener("mouseup", handleMouseEvents);
    }
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

export function getState(): State {
  return state;
}

export function getQuadrant(): Quadrant {
  return quadrant!;
}

function calcQuadrant(selectionBox: DOMRect): Quadrant {
  const { x, y } = selectionBox!;
  const borderX: number = window.innerWidth * 0.75;
  const borderY: number = window.innerHeight - 80;
  if (x <= borderX && y <= borderY) return "topLeft";
  if (x > borderX && y <= borderY) return "topRight";
  if (x <= borderX && y > borderY) return "bottomLeft";
  if (x > borderX && y > borderY) return "bottomRight";
  // Default quadrant
  return "topLeft";
}

function getMaxWidth(quadrant: Quadrant, selectionBox: DOMRect) {
  const clientWidth = document.body.clientWidth;
  switch (quadrant) {
    case "bottomRight":
    case "topRight": {
      const right: number = document.body.clientWidth - selectionBox!.right;
      return clientWidth - right - 100;
    }
    case "bottomLeft":
    case "topLeft": {
      return clientWidth - selectionBox!.left - 100;
    }
    default:
      throw new Error(
        "TAPEWORD Error: Could not calculate max-with based on quadrant"
      );
  }
}

function generateNullFrame(): HTMLElement {
  const nullFrame: HTMLElement = document.createElement("div");
  nullFrame.className = frameStyles.nullFrame;
  nullFrame.innerText = "No definition found 🙈";
  return nullFrame;
}

function createFrame(
  state: State,
  Components: {
    [c: string]: HTMLElement;
  },
  quadrant: Quadrant,
  maxDefWidth: number
): HTMLElement {
  // Add arrow-buttons
  // // To typesContainer if there's more than one wordType
  let typesContainer: HTMLElement = Components.typesContainer.cloneNode(
    true
  ) as HTMLElement;
  typesContainer = addButtons(typesContainer);

  // // To definitionsContainer if there's more than one Definition
  let definitionsContainer: HTMLElement = Components.definitionsContainer.cloneNode(
    true
  ) as HTMLElement;
  const wordType: string = Object.keys(state[state.length - 1][0])[0];
  const defEl: HTMLParagraphElement = definitionsContainer.childNodes[0]
    .childNodes[0] as HTMLParagraphElement;
  definitionsContainer = addButtons(definitionsContainer);
  if (state[state.length - 1][0][wordType].length > 1) {
    // Add padding-bottom to the definition element for style
    defEl.style.paddingBottom = "4px";
  } else {
    defEl.style.paddingBottom = "8px";
  }

  // Set max definitions container width
  definitionsContainer.style.maxWidth = maxDefWidth + "px";

  const frame: HTMLElement = document.createElement("div");
  frame.className = frameStyles.defFrame;
  frame.id = "T_A_P_E_WORD";

  if (quadrant === "bottomLeft" || quadrant === "topLeft") {
    definitionsContainer.style.setProperty(
      "padding-right",
      "17px",
      "important"
    );
    frame.appendChild(typesContainer);
    frame.appendChild(definitionsContainer);
  } else {
    definitionsContainer.style.setProperty("padding-left", "17px", "important");
    definitionsContainer.style.alignItems = "flex-end";
    frame.appendChild(definitionsContainer);
    frame.appendChild(typesContainer);
  }

  return frame;
}

function populateFrame(frameSkeleton: HTMLElement, definitions: Definitions) {
  const frame: HTMLElement = frameSkeleton.cloneNode(true) as HTMLElement;
  const [wordType]: string[] = Object.keys(definitions);
  const defObj: Definition = definitions[wordType][0];
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

/**
 * MOUSE-CLICK LOGIC
 *
 * Track mouse-down to enable user to begin a click
 * (mousedown) inside a frame, drag, and finish the click
 * (mouseup) outside the frame without frame deletion
 * */
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

        const lastChild: HTMLElement = body.lastChild as HTMLElement;
        if (lastChild.id === "T_A_P_E_WORD") {
          body.removeChild(lastChild);
        } else {
          body.removeChild(frame);
        }

        // Remove the latest definitions array from the state stack
        state.pop();

        // Update styling
        handleArrows();
        handleAlignment();
      } else {
        isPointerDragged = false;
      }
    }
    default:
      throw new Error("TAPEWORD Error: Could not handle mouse event");
  }
}
