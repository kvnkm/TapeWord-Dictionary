import { upArrow, downArrow, leftArrow, rightArrow } from "./arrowButtons";
import typeStyles from "../../styles/types.css";
import defStyles from "../../styles/definitions.css";

export default function addButtons(el: HTMLElement): HTMLElement {
  switch (el.className) {
    case typeStyles.typesContainer:
      {
        const upArrowContainer: HTMLButtonElement = document.createElement(
          "button"
        );
        const downArrowContainer: HTMLButtonElement = document.createElement(
          "button"
        );
        const wordType: HTMLHeadingElement = el.getElementsByClassName(
          typeStyles.typesLabel
        )[0] as HTMLHeadingElement;
        upArrowContainer.className = typeStyles.upArrowContainer;
        downArrowContainer.className = typeStyles.downArrowContainer;
        upArrowContainer.appendChild(upArrow);
        downArrowContainer.appendChild(downArrow);
        el.insertBefore(upArrowContainer, wordType);
        el.appendChild(downArrowContainer);
      }
      break;

    case defStyles.definitionsContainer:
      {
        const definitionsControl: HTMLElement = document.createElement("div");
        const leftArrowContainer: HTMLButtonElement = document.createElement(
          "button"
        );
        const rightArrowContainer: HTMLButtonElement = document.createElement(
          "button"
        );
        definitionsControl.className = defStyles.controlsContainer;
        leftArrowContainer.className = defStyles.leftArrowContainer;
        rightArrowContainer.className = defStyles.rightArrowContainer;
        leftArrowContainer.appendChild(leftArrow);
        rightArrowContainer.appendChild(rightArrow);
        definitionsControl.appendChild(leftArrowContainer);
        definitionsControl.appendChild(rightArrowContainer);
        el.appendChild(definitionsControl);
      }
      break;

    default:
      throw new Error(
        "TAPEWORD Error: (From addButtons.ts) This component doesn't need buttons"
      );
  }

  return el;
}
