import { Quadrant, Frame, RenderType } from "../../../types";
import { getFrames } from "../../../view";
import { upArrow, downArrow, leftArrow, rightArrow } from "../addButtons/arrowButtons";
import frameStyles from "../../styles/frame.css";
import typeStyles from "../../styles/types.css";
import defStyles from "../../styles/definitions.css";

export default function render(this: Frame, renderType: RenderType): void {
  if (renderType === "error") {
    placeFrame(this.element, this.selectionBox, this.quadrant);
    this.element.addEventListener("wheel", (e) => e.preventDefault());
    return;
  }

  const childrenArray: HTMLElement[] = Array.from(this.element.children as HTMLCollectionOf<HTMLElement>);
  const definitionsContainer: HTMLElement = childrenArray.filter((child) => child.className === defStyles.definitionsContainer)[0];
  const typesContainer: HTMLElement = childrenArray.filter((child) => child.className === typeStyles.typesContainer)[0];
  const typesLabel: HTMLElement = typesContainer.children[1] as HTMLElement;
  const defEl: HTMLElement = definitionsContainer.children[0].children[0] as HTMLElement;
  const exampleEl: HTMLElement = definitionsContainer.children[0].children[1] as HTMLElement;

  // Upon arrow-click, remove all frames in stack that are above the current frame.
  if (renderType !== "initial") {
    const frames: Frame[] = getFrames();
    const frameIndex: number = parseInt(this.id.split("T_A_P_E_WORD_")[1]);
    const removalFrames: Frame[] = frames.splice(frameIndex + 1);
    const body: HTMLBodyElement = document.getElementsByTagName("body")[0] as HTMLBodyElement;

    removalFrames.forEach((frame) => body.removeChild(frame.element));
  }

  switch (renderType) {
    case "initial":
      {
        placeFrame(this.element, this.selectionBox, this.quadrant);
        this.element.addEventListener("click", onArrowClick.bind(this));

        // Add scroll event listeners if definition is found
        if (this.element.className === frameStyles.defFrame) {
          typesContainer.addEventListener("wheel", (e) => e.preventDefault());
          definitionsContainer.addEventListener("wheel", onDefScroll);
        }
      }
      break;

    case "prevType":
      {
        // Decrement wordTypeIndex and update DOM element texts
        this.wordTypeIndex--;
        typesLabel.innerText = this.defs[this.wordTypeIndex].wordType;
      }
      break;

    case "nextType":
      {
        // Increment wordTypeIndex and update DOM element texts
        this.wordTypeIndex++;
        typesLabel.innerText = this.defs[this.wordTypeIndex].wordType;
      }
      break;

    case "prevDef":
      {
        // Decrement the index at defsIndex[wordTypeIndex]
        this.defsIndex[this.wordTypeIndex]--;
      }
      break;

    case "nextDef":
      {
        // Increment the index at defsIndex[wordTypeIndex]
        this.defsIndex[this.wordTypeIndex]++;
      }
      break;
  }

  // Update definition and example DOM element texts
  defEl.innerText = this.defs[this.wordTypeIndex]["defStrings"][this.defsIndex[this.wordTypeIndex]]["def"];
  exampleEl.innerText = this.defs[this.wordTypeIndex]["defStrings"][this.defsIndex[this.wordTypeIndex]]["example"];

  // Align flex-end if textContainer is NOT scrollable and the quadrant is on the right side
  handleAlignment(this.element);

  // Blur the text if needed
  handleBlur("newDef", definitionsContainer);

  // Add/remove arrows as necessary
  handleArrows(this);
}

/**
██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗     ███████╗██╗   ██╗███╗   ██╗ ██████╗███████╗
██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║   ██║████╗  ██║██╔════╝██╔════╝
███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝    █████╗  ██║   ██║██╔██╗ ██║██║     ███████╗
██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗    ██╔══╝  ██║   ██║██║╚██╗██║██║     ╚════██║
██║  ██║███████╗███████╗██║     ███████╗██║  ██║    ██║     ╚██████╔╝██║ ╚████║╚██████╗███████║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝                                                                                        
 */

/**
 * Aligns textContainer to flex-end if:
 *    - frame direction is "left"
 *    - textContainer is NOT scrollable
 */
export function handleAlignment(el: HTMLElement): void {
  const firstElement: HTMLElement = el.children[0] as HTMLElement;
  const frameDirection: "left" | "right" = firstElement.className === typeStyles.typesContainer ? "right" : "left";
  const textContainer: HTMLElement = el.getElementsByClassName(defStyles.textContainer)[0] as HTMLElement;

  if (frameDirection === "left" && !(textContainer.offsetWidth < textContainer.scrollWidth)) {
    textContainer.style.alignItems = "flex-end";
  } else {
    textContainer.style.alignItems = "start";
  }
}

export function handleArrows(frame: Frame): void {
  const childrenArray: HTMLElement[] = Array.from(frame.element.children as HTMLCollectionOf<HTMLElement>);
  const definitionsContainer: HTMLElement = childrenArray.filter((child) => child.className === defStyles.definitionsContainer)[0];
  const typesContainer: HTMLElement = childrenArray.filter((child) => child.className === typeStyles.typesContainer)[0];
  const upArrowContainer: HTMLButtonElement = typesContainer.children[0] as HTMLButtonElement;
  const downArrowContainer: HTMLButtonElement = typesContainer.children[2] as HTMLButtonElement;
  const leftArrowContainer: HTMLButtonElement = definitionsContainer.children[1].children[0] as HTMLButtonElement;
  const rightArrowContainer: HTMLButtonElement = definitionsContainer.children[1].children[1] as HTMLButtonElement;

  if (frame.wordTypeIndex === 0 && upArrowContainer.disabled === false) {
    disableArrow(upArrowContainer);
  } else if (frame.wordTypeIndex !== 0 && upArrowContainer.disabled === true) {
    enableArrow(upArrowContainer);
  }

  if (frame.wordTypeIndex === frame.defs.length - 1 && downArrowContainer.disabled === false) {
    disableArrow(downArrowContainer);
  } else if (frame.wordTypeIndex !== frame.defs.length - 1 && downArrowContainer.disabled === true) {
    enableArrow(downArrowContainer);
  }

  if (frame.defsIndex[frame.wordTypeIndex] === 0 && leftArrowContainer.disabled === false) {
    disableArrow(leftArrowContainer);
  } else if (frame.defsIndex[frame.wordTypeIndex] !== 0 && leftArrowContainer.disabled === true) {
    enableArrow(leftArrowContainer);
  }

  if (
    frame.defsIndex[frame.wordTypeIndex] === frame.defs[frame.wordTypeIndex]["defStrings"].length - 1 &&
    rightArrowContainer.disabled === false
  ) {
    disableArrow(rightArrowContainer);
  } else if (
    frame.defsIndex[frame.wordTypeIndex] !== frame.defs[frame.wordTypeIndex]["defStrings"].length - 1 &&
    rightArrowContainer.disabled === true
  ) {
    enableArrow(rightArrowContainer);
  }
}

function enableArrow(arrowContainer: HTMLButtonElement): void {
  // Enable button
  arrowContainer.disabled = false;
  const svg: SVGElement = arrowContainer.children[0] as SVGElement;
  const direction: string = svg.id.split("Arrow")[0];
  switch (direction) {
    case "up":
      {
        const _upArrow: SVGElement = upArrow.cloneNode(true) as SVGElement;
        arrowContainer.className = typeStyles.upArrowContainer;
        arrowContainer.removeChild(arrowContainer.children[0]);
        arrowContainer.appendChild(_upArrow);
      }
      break;
    case "down":
      {
        const _downArrow: SVGElement = downArrow.cloneNode(true) as SVGElement;
        arrowContainer.className = typeStyles.downArrowContainer;
        arrowContainer.removeChild(arrowContainer.children[0]);
        arrowContainer.appendChild(_downArrow);
      }
      break;
    case "left":
      {
        const _leftArrow: SVGElement = leftArrow.cloneNode(true) as SVGElement;
        arrowContainer.className = defStyles.leftArrowContainer;
        arrowContainer.removeChild(arrowContainer.children[0]);
        arrowContainer.appendChild(_leftArrow);
      }
      break;
    case "right": {
      const _rightArrow: SVGElement = rightArrow.cloneNode(true) as SVGElement;
      arrowContainer.className = defStyles.rightArrowContainer;
      arrowContainer.removeChild(arrowContainer.children[0]);
      arrowContainer.appendChild(_rightArrow);
    }
  }
}

function disableArrow(arrowContainer: HTMLButtonElement): void {
  // Disable button
  const definitionsContainer: HTMLElement | null = arrowContainer.closest("." + defStyles.definitionsContainer);
  arrowContainer.className = definitionsContainer ? defStyles.disabledArrowContainer : typeStyles.disabledArrowContainer;
  arrowContainer.disabled = true;

  // Blur styling
  const svg: SVGElement = arrowContainer.children[0] as SVGElement;
  const path: SVGPathElement = svg.getElementsByTagName("path")[0];
  const feOffset: SVGFEOffsetElement = svg.getElementsByTagName("feOffset")[0];
  const feBlends: HTMLCollectionOf<SVGFEBlendElement> = svg.getElementsByTagName("feBlend");

  path.setAttribute("fill-opacity", "0.03");

  // // Remove svg filters
  [feOffset, feBlends[0], feBlends[1]].forEach((el) => {
    el.parentElement?.removeChild(el);
  });
}

function handleBlur(type: "newDef" | "scroll", definitionsContainer: HTMLElement) {
  const textContainer: HTMLElement = definitionsContainer.childNodes[0] as HTMLElement;
  const scrollable = textContainer.offsetWidth < textContainer.scrollWidth;
  const blur: HTMLElement | undefined = definitionsContainer.getElementsByClassName(defStyles.blur)[0] as HTMLElement;
  switch (type) {
    case "newDef":
      {
        if (scrollable && !blur) {
          // Add blur component
          const blur: HTMLElement = document.createElement("div");
          blur.className = defStyles.blur;
          definitionsContainer.appendChild(blur);
        }
        if (!scrollable && blur) {
          // Remove blur component
          definitionsContainer.removeChild(blur);
        }
      }
      break;
    case "scroll": {
      //
      if (textContainer.offsetWidth + textContainer.scrollLeft >= textContainer.scrollWidth - 1) {
        // Remove blur component
        definitionsContainer.removeChild(blur);
      } else if (textContainer.offsetWidth + textContainer.scrollLeft < textContainer.scrollWidth && !blur) {
        // Add blur component
        const blur: HTMLElement = document.createElement("div");
        blur.className = defStyles.blur;
        definitionsContainer.appendChild(blur);
      }
    }
    default:
      throw new Error("TAPEWORD Error: error in handling blur component");
  }
}

export function placeFrame(element: HTMLElement, selectionBox: DOMRect, quadrant: Quadrant): void {
  const body: HTMLBodyElement = document.getElementsByTagName("body")[0] as HTMLBodyElement;
  element.style.position = "absolute";

  // Calculate the necessary offset distance from viewport-top
  const bodyTopDiscrepancy: number = body.getBoundingClientRect().top + window.pageYOffset;
  const bodyTopOffset: number = body.getBoundingClientRect().top - bodyTopDiscrepancy;
  let top: number = selectionBox!.bottom - bodyTopOffset;

  // Calculate the scrollbar-width in case the frame direction is left
  const scrollBox: HTMLDivElement = document.createElement("div");
  scrollBox.style.overflow = "scroll";
  document.body.appendChild(scrollBox);
  const scrollBarWidth: number = scrollBox.offsetWidth - scrollBox.clientWidth;
  document.body.removeChild(scrollBox);

  switch (quadrant) {
    case "topLeft":
      {
        const bodyLeftDiscrepancy: number = body.getBoundingClientRect().left + window.pageXOffset;
        const bodyLeftOffset: number = body.getBoundingClientRect().left - bodyLeftDiscrepancy;
        const left: number = selectionBox!.left - bodyLeftOffset;

        element.style.top = top + "px";
        element.style.left = left + "px";
      }
      break;
    case "topRight":
      {
        const right = window.innerWidth - selectionBox!.right - scrollBarWidth;

        element.style.top = top + "px";
        element.style.right = right + "px";
      }
      break;
    case "bottomLeft":
      {
        const bodyLeftDiscrepancy: number = body.getBoundingClientRect().left + window.pageXOffset;
        const bodyLeftOffset: number = body.getBoundingClientRect().left - bodyLeftDiscrepancy;
        const left: number = selectionBox!.left - bodyLeftOffset;

        const elementHeight = ((element) => {
          element.style.visibility = "hidden";
          document.body.appendChild(element);
          const elementHeight: number = element.offsetHeight;
          document.body.removeChild(element);
          element.style.visibility = "visible";
          return elementHeight;
        })(element);

        top = top - selectionBox!.height - elementHeight;

        element.style.top = top + "px";
        element.style.left = left + "px";
      }
      break;
    case "bottomRight":
      {
        const elementHeight = ((element) => {
          element.style.visibility = "hidden";
          document.body.appendChild(element);
          const elementHeight: number = element.offsetHeight;
          document.body.removeChild(element);
          element.style.visibility = "visible";
          return elementHeight;
        })(element);

        top = top - selectionBox!.height - elementHeight;

        const right = window.innerWidth - selectionBox!.right - scrollBarWidth;

        element.style.top = top + "px";
        element.style.right = right + "px";
      }
      break;
    default:
      throw new Error("TAPEWORD Error: Could not place Frame onto DOM");
  }

  body.appendChild(element);
}

function onDefScroll(e: WheelEvent) {
  e.preventDefault();

  const targetEl: EventTarget = e.target!;
  const element: HTMLElement = (targetEl as HTMLElement).closest("." + frameStyles.frame) as HTMLElement;
  const delta: number = e.deltaX || e.deltaY;
  const childrenArray: HTMLElement[] = Array.from(element.children as HTMLCollectionOf<HTMLElement>);
  const definitionsContainer: HTMLElement = childrenArray.find((el) => el.className === defStyles.definitionsContainer)!;
  const textContainer: HTMLElement = definitionsContainer.children[0] as HTMLElement;

  textContainer.scrollLeft -= delta * -10;

  handleBlur("scroll", definitionsContainer);
}

function onArrowClick(e: Event): void {
  e.preventDefault();
  const arrowType: string = (e.target as HTMLElement).id || (e.target as HTMLElement).className;

  // Get frame from frame element
  const targetEl: EventTarget = e.target!;
  const element: HTMLElement = (targetEl as HTMLElement).closest("." + frameStyles.frame) as HTMLElement;
  const elementID: string = element.id;
  const frames: Frame[] = getFrames();
  const frame: Frame = frames.find((fr) => fr.id === elementID)!;

  switch (arrowType) {
    case typeStyles.upArrowContainer:
    case "upArrow_path":
    case "upArrow":
      {
        frame.render("prevType");
      }
      break;
    case typeStyles.downArrowContainer:
    case "downArrow_path":
    case "downArrow":
      {
        frame.render("nextType");
      }
      break;
    case defStyles.leftArrowContainer:
    case "leftArrow_path":
    case "leftArrow":
      {
        frame.render("prevDef");
      }
      break;
    case defStyles.rightArrowContainer:
    case "rightArrow_path":
    case "rightArrow": {
      frame.render("nextDef");
    }
    default:
      throw new Error("TAPEWORD Error: Registered click didn't originate from a button");
  }
}
