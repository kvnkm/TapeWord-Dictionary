import styles from "../../styles/definitions.css";

// Build definitions component
const definitionsContainer: HTMLElement = document.createElement("div");
const textContainer: HTMLElement = document.createElement("div");
const definition: HTMLParagraphElement = document.createElement("p");
const example: HTMLParagraphElement = document.createElement("p");

definitionsContainer.className = styles.definitionsContainer;
textContainer.className = styles.textContainer;
definition.className = styles.definition;
example.className = styles.example;

textContainer.appendChild(definition);
textContainer.appendChild(example);
definitionsContainer.appendChild(textContainer);

export default definitionsContainer;
