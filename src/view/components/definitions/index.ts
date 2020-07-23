import styles from "../../styles/definitions.css";
import { leftArrow, rightArrow } from "../arrowButton";

// Build definitions component
const definitionsContainer: HTMLDivElement = document.createElement("div");
const definition: HTMLParagraphElement = document.createElement("p");
const example: HTMLParagraphElement = document.createElement("p");
const definitionsControl: HTMLDivElement = document.createElement("div");
const leftArrowContainer: HTMLButtonElement = document.createElement("button");
const rightArrowContainer: HTMLButtonElement = document.createElement("button");

definitionsContainer.className = styles.definitionsContainer;
definition.className = styles.definition;
example.className = styles.example;
definitionsControl.className = styles.controlsContainer;
leftArrowContainer.className = styles.leftArrowContainer;
rightArrowContainer.className = styles.rightArrowContainer;

definitionsContainer.appendChild(definition);
definitionsContainer.appendChild(example);
leftArrowContainer.appendChild(leftArrow);
rightArrowContainer.appendChild(rightArrow);
definitionsControl.appendChild(leftArrowContainer);
definitionsControl.appendChild(rightArrowContainer);
definitionsContainer.appendChild(definitionsControl);

export default definitionsContainer;
