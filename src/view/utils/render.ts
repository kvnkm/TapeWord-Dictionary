import { Definition, Definitions, RenderType } from "../../types";
import { getState } from "../display";

function getNewStrings(definitions: Definitions): { [term: string]: string } {
  const [wordType]: string[] = Object.keys(definitions);
  const defString: string = definitions[wordType].defs[0].def;
  const exampleString: string = definitions[wordType].defs[0].example;

  return { wordType, defString, exampleString };
}

function reRender(
  renderType: RenderType,
  newStrings: { [term: string]: string }
): void {
  //
  const defEl: HTMLElement = document.getElementsByClassName(
    "definitions__definition"
  )[0] as HTMLElement;
  const exampleEl: HTMLElement = document.getElementsByClassName(
    "definitions__example"
  )[0] as HTMLElement;

  defEl.innerText = newStrings.defString;
  exampleEl.innerText = newStrings.exampleString;

  switch (renderType) {
    case "newType": {
      // Re-render types & definitions components
      // FIXME - Implement animations
      const wordTypeEl: HTMLHeadingElement = document.querySelectorAll(
        "h1.types__label"
      )[0] as HTMLHeadingElement;
      wordTypeEl.innerText = newStrings.wordType;
      render(wordTypeEl);
    }
    case "newDefinition":
      {
        render(defEl);
        render(exampleEl);
      }
      break;
    default:
      throw new Error(
        "WORDSTAR Error: arg -> renderType wasn't supplied correctly in [reRender(renderType: RenderType, newStrings: { [term: string]: string }): void]"
      );
  }
}

function onArrowClick(e: Event): void {
  const state = getState();
  const arrowType: string = (e.target as HTMLElement).id;
  const wordType: string = Object.keys(state[0])[0];
  const defs: Definition[] = state[0][wordType].defs;

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
        const defsTail: Definition = defs.shift()!;
        defs.push(defsTail);

        reRender("newDefinition", getNewStrings(state[0]));
      }
      break;
    case "rightArrow_path":
    case "rightArrow": {
      // Rotate state[wordType].defs array forwards
      const defsHead: Definition = defs.pop()!;
      defs.unshift(defsHead);

      reRender("newDefinition", getNewStrings(state[0]));
    }
    default:
      throw new Error(
        "WORDSTAR Error: Registered click didn't originate from a button"
      );
  }
}

export default function render(element: HTMLElement): void {
  const componentName: string = element.className;
  // Declare function-scoped element for access by case blocks
  const definitionsContainer: HTMLDivElement = document.getElementsByClassName(
    "definitions"
  )[0] as HTMLDivElement;
  switch (componentName) {
    case "-_WORDSTAR_-def-frame":
      // Inject frame into DOM
      const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
      body.appendChild(element);

      // Add button-click event listeners
      const mainFrame: HTMLDivElement = document.getElementsByClassName(
        "-_WORDSTAR_-def-frame"
      )[0] as HTMLDivElement;
      mainFrame.addEventListener("click", onArrowClick);
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
      throw new Error(
        "WORDSTAR Error: [render(element: HTMLElement): void] could not handle for componentName"
      );
  }
}
