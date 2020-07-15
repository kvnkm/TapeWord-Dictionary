import { Definition, Definitions, RenderType } from "../../types";
import { getState } from "../display";

function getNewStrings(definitions: Definitions): { [term: string]: string } {
  const [wordType]: string[] = Object.keys(definitions);
  const defString: string = definitions[wordType].defs[0].def;
  const exampleString: string = definitions[wordType].defs[0].example;

  return { wordType, defString, exampleString };
}

function hydrate(): void {
  // Test event-propagation listener
  const mainFrame: HTMLDivElement = document.getElementsByClassName(
    "-_WORDSTAR_-main-frame"
  )[0] as HTMLDivElement;
  mainFrame.addEventListener("click", onArrowClick);
}

function reRender(
  renderType: RenderType,
  newStrings: { [term: string]: string }
): void {
  //
  switch (renderType) {
    case "newType": {
      // Re-render types & definitions components
      // FIXME - Implement animations
      const wordTypeEl: HTMLHeadingElement = document.querySelectorAll(
        "h1.types__label"
      )[0] as HTMLHeadingElement;
      const defEl: HTMLElement = document.getElementsByClassName(
        "definitions__definition"
      )[0] as HTMLElement;
      const exampleEl: HTMLElement = document.getElementsByClassName(
        "definitions__example"
      )[0] as HTMLElement;
      wordTypeEl.innerText = newStrings.wordType;
      defEl.innerText = newStrings.defString;
      exampleEl.innerText = newStrings.exampleString;
      render(wordTypeEl);
      render(defEl);
      render(exampleEl);

      break;
    }
    case "newDefinition": {
      const defEl: HTMLElement = document.getElementsByClassName(
        "definitions__definition"
      )[0] as HTMLElement;
      const exampleEl: HTMLElement = document.getElementsByClassName(
        "definitions__example"
      )[0] as HTMLElement;
      defEl.innerText = newStrings.defString;
      exampleEl.innerText = newStrings.exampleString;
      render(defEl);
      render(exampleEl);

      break;
    }
    default:
      console.log("Error during re-rendering");
  }
}

function onArrowClick(e: Event): void {
  // Get state & arrow-type
  const state = getState();
  const arrowType: string = (e.target as HTMLElement).id;

  switch (arrowType) {
    case "upArrow_path":
    case "upArrow":
      {
        // Rotate state backwards
        const stateTail: Definitions = state.shift()!;
        state.push(stateTail);

        reRender("newType", getNewStrings(state[0]));
      }
      break;
    case "downArrow_path":
    case "downArrow":
      {
        // Rotate state forwards
        const stateHead: Definitions = state.pop()!;
        state.unshift(stateHead);

        reRender("newType", getNewStrings(state[0]));
      }
      break;
    case "leftArrow_path":
    case "leftArrow":
      {
        // Rotate state[wordType].defs array backwards
        const wordType: string = Object.keys(state[0])[0];
        const defs: Definition[] = state[0][wordType].defs;
        const defsTail: Definition = defs.shift()!;
        defs.push(defsTail);

        reRender("newDefinition", getNewStrings(state[0]));
      }
      break;
    case "rightArrow_path":
    case "rightArrow":
      {
        // Rotate state[wordType].defs array forwards
        const wordType: string = Object.keys(state[0])[0];
        const defs: Definition[] = state[0][wordType].defs;
        const defsHead: Definition = defs.pop()!;
        defs.unshift(defsHead);

        reRender("newDefinition", getNewStrings(state[0]));
      }
      break;
    default:
      break;
  }
}

export default function render(element: HTMLElement): void {
  const componentName: string = element.className;
  // Declare function-scoped elements for access by case blocks
  const definitionsContainer: HTMLDivElement = document.getElementsByClassName(
    "definitions"
  )[0] as HTMLDivElement;
  switch (componentName) {
    case "-_WORDSTAR_-main-frame":
      // Inject frame into DOM
      const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
      body.appendChild(element);

      // Add button-click event listeners
      hydrate();
      break;

    case "types__label":
      // Remove old wordType, definition, and example
      const typesLabel: HTMLHeadingElement = document.getElementsByClassName(
        "types__label"
      )[0] as HTMLHeadingElement;
      const typesContainer: HTMLDivElement = document.getElementsByClassName(
        "types"
      )[0] as HTMLDivElement;
      typesContainer.removeChild(typesLabel);

      // Inject new types label
      typesContainer.appendChild(element);
      break;

    case "definitions__definition":
      // Remove old definition
      const definition: HTMLParagraphElement = document.getElementsByClassName(
        "definitions__definition"
      )[0] as HTMLParagraphElement;
      definitionsContainer.removeChild(definition);

      // Inject the new definition paragraph element
      definitionsContainer.appendChild(element);
      break;
    case "definitions__example":
      // Remove old example
      const example: HTMLParagraphElement = document.getElementsByClassName(
        "definitions__example"
      )[0] as HTMLParagraphElement;
      definitionsContainer.removeChild(example);

      // Inject the new example paragraph element
      definitionsContainer.appendChild(element);
      break;
    default:
      console.log("default switch execution");
  }
}
