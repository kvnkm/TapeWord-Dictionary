import { Definition, Definitions, RenderType } from "../../../types";
import { getState } from "../../../view";
import frameStyles from "../../styles/frame.css";
import typeStyles from "../../styles/types.css";
import defStyles from "../../styles/definitions.css";

function getNewStrings(definitions: Definitions): { [term: string]: string } {
  const [wordType]: string[] = Object.keys(definitions);
  const defString: string = definitions[wordType].defs[0].def;
  const exampleString: string = definitions[wordType].defs[0].example
    ? "e.g. " + definitions[wordType].defs[0].example
    : "";

  return { wordType, defString, exampleString };
}

function reRender(
  renderType: RenderType,
  newStrings: { [term: string]: string }
): void {
  //
  const defEl: HTMLElement = document.getElementsByClassName(
    defStyles.definition
  )[0] as HTMLElement;
  const exampleEl: HTMLElement = document.getElementsByClassName(
    defStyles.example
  )[0] as HTMLElement;

  defEl.innerText = newStrings.defString;
  exampleEl.innerText = newStrings.exampleString;

  switch (renderType) {
    case "newType":
      // Re-render types & definitions components
      // FIXME - Implement animations
      const wordTypeEl: HTMLHeadingElement = document.getElementsByClassName(
        typeStyles.typesLabel
      )[0] as HTMLHeadingElement;
      wordTypeEl.innerText = newStrings.wordType;
      render(wordTypeEl);

    case "newDefinition":
      render(defEl);
      render(exampleEl);

    default:
      throw new Error(
        "WORDSTAR Error: arg -> renderType wasn't supplied correctly in [reRender(renderType: RenderType, newStrings: { [term: string]: string }): void]"
      );
  }
}

function onArrowClick(e: Event): void {
  const state = getState();
  const arrowType: string =
    (e.target as HTMLElement).id || (e.target as HTMLElement).className;
  const wordType: string = Object.keys(state[0])[0];
  const defs: Definition[] = state[0][wordType].defs;

  switch (arrowType) {
    case typeStyles.upArrowContainer:
    case "upArrow_path":
    case "upArrow":
      {
        // Rotate state forwards
        const stateHead: Definitions = state.pop()!;
        state.unshift(stateHead);

        reRender("newType", getNewStrings(state[0]));
      }
      break;
    case typeStyles.downArrowContainer:
    case "downArrow_path":
    case "downArrow":
      {
        // Rotate state backwards
        const stateTail: Definitions = state.shift()!;
        state.push(stateTail);

        reRender("newType", getNewStrings(state[0]));
      }
      break;
    case defStyles.leftArrowContainer:
    case "leftArrow_path":
    case "leftArrow":
      {
        // Rotate state[wordType].defs array forwards
        const defsHead: Definition = defs.pop()!;
        defs.unshift(defsHead);

        reRender("newDefinition", getNewStrings(state[0]));
      }
      break;
    case defStyles.rightArrowContainer:
    case "rightArrow_path":
    case "rightArrow": {
      // Rotate state[wordType].defs array backwards
      const defsTail: Definition = defs.shift()!;
      defs.push(defsTail);

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
    defStyles.definitionsContainer
  )[0] as HTMLDivElement;
  switch (componentName) {
    case frameStyles.defFrame:
      // Inject frame into DOM
      const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
      body.appendChild(element);

      // Add button-click event listeners
      const mainFrame: HTMLDivElement = document.getElementsByClassName(
        frameStyles.defFrame
      )[0] as HTMLDivElement;
      mainFrame.addEventListener("click", onArrowClick);

      break;

    case typeStyles.typesLabel:
      const typesLabel: HTMLHeadingElement = document.getElementsByClassName(
        typeStyles.typesLabel
      )[0] as HTMLHeadingElement;
      const typesContainer: HTMLDivElement = document.getElementsByClassName(
        typeStyles.typesContainer
      )[0] as HTMLDivElement;
      const upArrowContainer: HTMLButtonElement = document.getElementsByClassName(
        typeStyles.upArrowContainer
      )[0] as HTMLButtonElement;
      typesContainer.removeChild(typesLabel);

      // Inject new types label
      upArrowContainer.insertAdjacentElement("afterend", element);

      break;

    case defStyles.definition:
      {
        // Remove old definition
        const definition: HTMLParagraphElement = document.getElementsByClassName(
          defStyles.definition
        )[0] as HTMLParagraphElement;
        const example: HTMLParagraphElement = document.getElementsByClassName(
          defStyles.example
        )[0] as HTMLParagraphElement;
        definitionsContainer.removeChild(definition);

        // Inject the new definition paragraph element
        example.insertAdjacentElement("beforebegin", element);
      }
      break;
    case defStyles.example:
      // Remove old example
      const example: HTMLParagraphElement = document.getElementsByClassName(
        defStyles.example
      )[0] as HTMLParagraphElement;
      const definition: HTMLParagraphElement = document.getElementsByClassName(
        defStyles.definition
      )[0] as HTMLParagraphElement;
      definitionsContainer.removeChild(example);

      // Inject the new example paragraph element
      definition.insertAdjacentElement("afterend", element);

      break;
    default:
      throw new Error(
        "WORDSTAR Error: [render(element: HTMLElement): void] could not handle for componentName"
      );
  }
}
