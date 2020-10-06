import { State, Definition, Definitions, Quadrant } from "../../../types";
import { getState } from "../../../view";
import frameStyles from "../../styles/frame.css";
import typeStyles from "../../styles/types.css";
import defStyles from "../../styles/definitions.css";

export default function render(
  element: HTMLElement,
  selectionBox?: DOMRect,
  quadrant?: Quadrant
): void {
  placeFrame(element, selectionBox!, quadrant!);

  // Add button-click event listeners
  const frame: HTMLElement = getComponent(frameStyles.frame, 1);
  frame.addEventListener("click", onArrowClick);

  if (element.className === frameStyles.defFrame) {
    // Add scroll event listeners
    const definitionsContainer: HTMLElement = getComponent(
      defStyles.definitionsContainer,
      1
    );
    const typesContainer: HTMLElement = getComponent(
      typeStyles.typesContainer,
      1
    );
    typesContainer.addEventListener("wheel", onTypeScroll);
    definitionsContainer.addEventListener("wheel", onDefScroll);
  }

  // Align flex-end if textContainer is NOT scrollable and the quadrant is on the right side
  handleAlignment();

  // Blur the text if needed
  handleBlur("newDef");

  // Add/remove arrows as necessary
  handleArrows();
}

/**
 * Retrieves the nth instance of a given component (in case there are nested TapeWord frames)
 * @param cssType {string} CSS Modules hash
 */
function getComponent(cssType: string, order: number): HTMLElement {
  const componentCollection: HTMLCollectionOf<Element> = document.getElementsByClassName(
    cssType
  );
  return componentCollection[componentCollection.length - order] as HTMLElement;
}

/**
 * Aligns textContainer to flex-end if:
 *    - frame direction is "left"
 *    - textContainer is NOT scrollable
 */
export function handleAlignment(): void {
  const frame: HTMLElement = getComponent(frameStyles.frame, 1);
  const frameDirection = ((frame: HTMLElement): "left" | "right" => {
    const firstElement = frame.children[0];
    if (firstElement.className === typeStyles.typesContainer) {
      return "right";
    } else {
      return "left";
    }
  })(frame);

  const textContainer: HTMLElement = getComponent(defStyles.textContainer, 1);

  if (
    frameDirection === "left" &&
    !(textContainer.offsetWidth < textContainer.scrollWidth)
  ) {
    textContainer.style.alignItems = "flex-end";
  } else {
    textContainer.style.alignItems = "start";
  }
}

export function handleArrows(): void {
  const state: State = getState();
  const wordType: string = Object.keys(state[state.length - 1][0])[0];

  // typesContainer
  let upArrowContainer: HTMLElement = getComponent(
    typeStyles.upArrowContainer,
    1
  );
  let downArrowContainer: HTMLElement = getComponent(
    typeStyles.downArrowContainer,
    1
  );
  if (state[state.length - 1].length <= 1) {
    // remove buttons from typesContainer
    upArrowContainer.style.visibility = "hidden";
    downArrowContainer.style.visibility = "hidden";
  } else {
    upArrowContainer.style.visibility = "visible";
    downArrowContainer.style.visibility = "visible";
  }

  // definitionsContainer
  let controlsContainer: HTMLElement = getComponent(
    defStyles.controlsContainer,
    1
  );
  if (state[state.length - 1][0][wordType].length <= 1) {
    controlsContainer.style.visibility = "hidden";
  } else {
    controlsContainer.style.visibility = "visible";
  }

  ///////

  // Hide arrows of previous frame if new frame is created
  if (state.length > 1) {
    upArrowContainer = getComponent(typeStyles.upArrowContainer, 2);
    downArrowContainer = getComponent(typeStyles.downArrowContainer, 2);
    controlsContainer = getComponent(defStyles.controlsContainer, 2);

    upArrowContainer.style.visibility = "hidden";
    downArrowContainer.style.visibility = "hidden";
    controlsContainer.style.visibility = "hidden";
  }
}

function handleBlur(type: "newDef" | "scroll") {
  const definitionsContainer: HTMLElement = getComponent(
    defStyles.definitionsContainer,
    1
  );
  const textContainer: HTMLElement = definitionsContainer
    .childNodes[0] as HTMLElement;
  const scrollable = textContainer.offsetWidth < textContainer.scrollWidth;
  const blur:
    | HTMLElement
    | undefined = definitionsContainer.getElementsByClassName(
    defStyles.blur
  )[0] as HTMLElement;
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
      if (
        textContainer.offsetWidth + textContainer.scrollLeft >=
        textContainer.scrollWidth - 1
      ) {
        // Remove blur component
        definitionsContainer.removeChild(blur);
      } else if (
        textContainer.offsetWidth + textContainer.scrollLeft <
          textContainer.scrollWidth &&
        !blur
      ) {
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

export function placeFrame(
  element: HTMLElement,
  selectionBox: DOMRect,
  quadrant: Quadrant
): void {
  // Dynamic placement logic
  const body: HTMLBodyElement = document.getElementsByTagName(
    "body"
  )[0] as HTMLBodyElement;

  element.style.position = "absolute";

  const bodyTopDiscrepancy: number =
    body.getBoundingClientRect().top + window.pageYOffset;
  const bodyTopOffset: number =
    body.getBoundingClientRect().top - bodyTopDiscrepancy;
  let top: number = selectionBox!.bottom - bodyTopOffset;

  switch (quadrant) {
    case "topLeft":
      {
        const bodyLeftDiscrepancy: number =
          body.getBoundingClientRect().left + window.pageXOffset;
        const bodyLeftOffset: number =
          body.getBoundingClientRect().left - bodyLeftDiscrepancy;
        const left: number = selectionBox!.left - bodyLeftOffset;

        element.style.top = top + "px";
        element.style.left = left + "px";
      }
      break;
    case "topRight":
      {
        const right = document.body.clientWidth - selectionBox!.right;

        element.style.top = top + "px";
        element.style.right = right + "px";
      }
      break;
    case "bottomLeft":
      {
        const bodyLeftDiscrepancy: number =
          body.getBoundingClientRect().left + window.pageXOffset;
        const bodyLeftOffset: number =
          body.getBoundingClientRect().left - bodyLeftDiscrepancy;
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

        const right = document.body.clientWidth - selectionBox!.right;

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
  const delta: number = e.deltaX || e.deltaY;
  const textContainer: HTMLElement = getComponent(defStyles.textContainer, 1);
  textContainer.scrollLeft -= delta * -10;

  handleBlur("scroll");
}

function onTypeScroll(e: WheelEvent) {
  e.preventDefault();
}

function getNewStrings(definitions: Definitions): { [term: string]: string } {
  const [wordType]: string[] = Object.keys(definitions);
  const defString: string = definitions[wordType][0].def;
  const exampleString: string = definitions[wordType][0].example
    ? "e.g. " + definitions[wordType][0].example
    : "";

  return { wordType, defString, exampleString };
}

function refresh(
  newStrings: { [term: string]: string },
  newType?: boolean
): void {
  // Add or remove arrows from definitionContainer based on defs.length
  const definitionsContainer: HTMLElement = getComponent(
    defStyles.definitionsContainer,
    1
  );

  // Reset textContainer alignment
  const textContainer: HTMLElement = getComponent(defStyles.textContainer, 1);
  textContainer.style.alignItems = "start";

  // Assign new strings to definition & example elements
  const defEl: HTMLElement = definitionsContainer.getElementsByClassName(
    defStyles.definition
  )[0] as HTMLElement;
  const exampleEl: HTMLElement = definitionsContainer.getElementsByClassName(
    defStyles.example
  )[0] as HTMLElement;
  defEl.innerText = newStrings.defString;
  exampleEl.innerText = newStrings.exampleString;

  // Align flex-end if textContainer is NOT scrollable and the quadrant is on the right side
  handleAlignment();

  // Blur the text if needed
  handleBlur("newDef");

  // Add/remove arrows as necessary
  handleArrows();

  if (newType) {
    // Re-render types components
    const typesLabel: HTMLElement = getComponent(typeStyles.typesLabel, 1);
    typesLabel.innerText = newStrings.wordType;
  }
}

function onArrowClick(e: Event): void {
  const state: State = getState();
  const arrowType: string =
    (e.target as HTMLElement).id || (e.target as HTMLElement).className;

  switch (arrowType) {
    case typeStyles.upArrowContainer:
    case "upArrow_path":
    case "upArrow":
      {
        // Rotate state forwards
        const stateHead: Definitions = state[state.length - 1].pop()!;
        state[state.length - 1].unshift(stateHead);

        refresh(getNewStrings(state[state.length - 1][0]), true);
      }
      break;
    case typeStyles.downArrowContainer:
    case "downArrow_path":
    case "downArrow":
      {
        // Rotate state backwards
        const stateTail: Definitions = state[state.length - 1].shift()!;
        state[state.length - 1].push(stateTail);

        refresh(getNewStrings(state[state.length - 1][0]), true);
      }
      break;
    case defStyles.leftArrowContainer:
    case "leftArrow_path":
    case "leftArrow":
      {
        // Rotate state[wordType] array forwards
        const wordType: string = Object.keys(state[state.length - 1][0])[0];
        const defs: Definition[] = state[state.length - 1][0][wordType];
        const defsHead: Definition = defs.pop()!;
        defs.unshift(defsHead);

        refresh(getNewStrings(state[state.length - 1][0]));
      }
      break;
    case defStyles.rightArrowContainer:
    case "rightArrow_path":
    case "rightArrow": {
      // Rotate state[wordType] array backwards
      const wordType: string = Object.keys(state[state.length - 1][0])[0];
      const defs: Definition[] = state[state.length - 1][0][wordType];
      const defsTail: Definition = defs.shift()!;
      defs.push(defsTail);

      refresh(getNewStrings(state[state.length - 1][0]));
    }
    default:
      throw new Error(
        "TAPEWORD Error: Registered click didn't originate from a button"
      );
  }
}
