import styles from "../../styles/types.css";
import { upArrow, downArrow } from "../arrowButton";

// Build types-control component
const typesContainer: HTMLDivElement = document.createElement("div");
const upArrowContainer: HTMLButtonElement = document.createElement("button");
const wordType: HTMLHeadingElement = document.createElement("h1");
const downArrowContainer: HTMLButtonElement = document.createElement("button");

typesContainer.className = styles.typesContainer;
upArrowContainer.className = styles.upArrowContainer;
wordType.className = styles.typesLabel;
downArrowContainer.className = styles.downArrowContainer;

upArrowContainer.appendChild(upArrow);
downArrowContainer.appendChild(downArrow);
typesContainer.appendChild(upArrowContainer);
typesContainer.appendChild(wordType);
typesContainer.appendChild(downArrowContainer);

export default typesContainer;
