import styles from "../styles/definitions.css";
import { leftArrow, rightArrow } from "./arrowButtons";

// Generate HTML elements
const definitionsContainer: HTMLElement = document.createElement("div");
const textContainer: HTMLElement = document.createElement("div");
const definition: HTMLParagraphElement = document.createElement("p");
const example: HTMLParagraphElement = document.createElement("p");

// Label elements by class names and nest
definitionsContainer.className = styles.definitionsContainer;
textContainer.className = styles.textContainer;
definition.className = styles.definition;
example.className = styles.example;
textContainer.appendChild(definition);
textContainer.appendChild(example);
definitionsContainer.appendChild(textContainer);


// Arrow button logic
const controlsContainer: HTMLElement = document.createElement("div");
const leftArrowContainer: HTMLButtonElement = document.createElement("button");
const rightArrowContainer: HTMLButtonElement = document.createElement("button");
controlsContainer.className = styles.controlsContainer;
leftArrowContainer.className = styles.leftArrowContainer;
rightArrowContainer.className = styles.rightArrowContainer;
leftArrowContainer.appendChild(leftArrow);
rightArrowContainer.appendChild(rightArrow);
controlsContainer.appendChild(leftArrowContainer);
controlsContainer.appendChild(rightArrowContainer);
definitionsContainer.appendChild(controlsContainer);

export default definitionsContainer;
