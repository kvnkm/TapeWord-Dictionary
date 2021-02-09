import { browser } from "webextension-polyfill-ts";
import { Quadrant, Frame } from "../types";
import { render, createElement } from "./utils";
import frameStyles from "./styles/frame.css";

let frames: Frame[] = [];
let selectionBox: DOMRect;
let quadrant: Quadrant;
let pointerDragged: boolean = false;

browser.runtime.onMessage.addListener((defs) => {
  if (defs === "getSelectionBox") {
    selectionBox = window.getSelection()?.getRangeAt(0).getBoundingClientRect() as DOMRect;
    return;
  }

  // Calculate max-width based on quadrant to prevent a long element from causing horizontal window-scroll
  quadrant = calcQuadrant(selectionBox!);
  const maxWidth: number = getMaxWidth(quadrant, selectionBox!);

  // Generate populated HTML element
  const frameCount: number = frames.length;
  const element: HTMLElement = createElement(defs, frameCount, quadrant, maxWidth);

  // Create index variables that will track the current word-type and definition
  const wordTypeIndex: number = 0;
  const defsIndex: number[] = defs
    ? ((defs) => {
        let dI: number[] = [];
        defs.forEach(() => dI.push(0));
        return dI;
      })(defs)
    : [];

  // Compose Frame instance object and append to global Frames stack
  const frame: Frame = {
    id: "T_A_P_E_WORD" + "_" + frameCount,
    wordTypeIndex,
    defsIndex,
    defs,
    render,
    element,
    selectionBox,
    quadrant,
  };
  frames.push(frame);

  // Render DOM element and add click-event listeners
  defs && frame.render("initial");
  !defs && frame.render("error");
  document.addEventListener("mousedown", handleMouseEvents);
  document.addEventListener("mouseup", handleMouseEvents);
});

/**
██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗     ███████╗██╗   ██╗███╗   ██╗ ██████╗███████╗
██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║   ██║████╗  ██║██╔════╝██╔════╝
███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝    █████╗  ██║   ██║██╔██╗ ██║██║     ███████╗
██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗    ██╔══╝  ██║   ██║██║╚██╗██║██║     ╚════██║
██║  ██║███████╗███████╗██║     ███████╗██║  ██║    ██║     ╚██████╔╝██║ ╚████║╚██████╗███████║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝                                                                                        
 */

export function getFrames(): Frame[] {
  return frames;
}

export function getQuadrant(): Quadrant {
  return quadrant!;
}

function calcQuadrant(selectionBox: DOMRect): Quadrant {
  const { x, y } = selectionBox!;
  const borderX: number = window.innerWidth * 0.75;
  const borderY: number = window.innerHeight - 95;
  if (x <= borderX && y <= borderY) return "topLeft";
  if (x > borderX && y <= borderY) return "topRight";
  if (x <= borderX && y > borderY) return "bottomLeft";
  if (x > borderX && y > borderY) return "bottomRight";
  // Default quadrant
  return "topLeft";
}

function getMaxWidth(quadrant: Quadrant, selectionBox: DOMRect) {
  switch (quadrant) {
    case "bottomRight":
    case "topRight": {
      const right: number = screen.width - selectionBox!.right;
      return screen.width - right - 120;
    }
    case "bottomLeft":
    case "topLeft": {
      return screen.width - selectionBox!.left - 120;
    }
    default:
      throw new Error("TAPEWORD Error: Could not calculate max-with based on quadrant");
  }
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
  const frameClicked: HTMLElement | null = (targetEl as HTMLElement).closest("." + frameStyles.frame);

  switch (eventType) {
    case "mousedown":
      frameClicked && (pointerDragged = true);
      break;

    case "mouseup": {
      if (!!frames.length && !frameClicked && !pointerDragged) {
        const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
        const frame: Frame = frames.pop()!;
        body.removeChild(frame.element);
      } else {
        pointerDragged = false;
      }
    }
  }
}
