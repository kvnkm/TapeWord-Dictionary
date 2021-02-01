import styles from "../styles/types.css";
import { upArrow, downArrow } from "./arrowButtons";

// Generate HTML elements
const typesContainer: HTMLElement = document.createElement("div");
const wordType: HTMLHeadingElement = document.createElement("h1");

// Label elements by class names and nest
typesContainer.className = styles.typesContainer;
wordType.className = styles.typesLabel;
typesContainer.appendChild(wordType);

// Arrow button logic
const upArrowContainer: HTMLButtonElement = document.createElement("button");
const downArrowContainer: HTMLButtonElement = document.createElement("button");
upArrowContainer.className = styles.upArrowContainer;
downArrowContainer.className = styles.downArrowContainer;
upArrowContainer.appendChild(upArrow);
downArrowContainer.appendChild(downArrow);
typesContainer.insertBefore(upArrowContainer, wordType);
typesContainer.appendChild(downArrowContainer);

export default typesContainer;
