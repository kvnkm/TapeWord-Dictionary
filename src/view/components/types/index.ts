import styles from "../../styles/types.css";

// Build types-control component
const typesContainer: HTMLElement = document.createElement("div");
const wordType: HTMLHeadingElement = document.createElement("h1");

typesContainer.className = styles.typesContainer;
wordType.className = styles.typesLabel;

typesContainer.appendChild(wordType);

export default typesContainer;
