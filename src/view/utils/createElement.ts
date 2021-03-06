import { Definitions, Quadrant } from "../../types";
import * as Components from "../components";
import frameStyles from "../styles/frame.css";
import typeStyles from "../styles/types.css";

export default function createElement(defs: Definitions | null, frameCount: number, quadrant: Quadrant, maxDefWidth: number) {
  // Return null version of element if defs is null (definition not found)
  if (!defs) {
    const nullFrame: HTMLElement = document.createElement("div");
    nullFrame.style.maxWidth = maxDefWidth + 120 + "px";
    nullFrame.className = frameStyles.nullFrame;
    nullFrame.innerText = "No definition found 🙈";
    return nullFrame;
  }

  // Clone Types & Definitions components
  let typesContainer: HTMLElement = Components.typesContainer.cloneNode(true) as HTMLElement;
  let definitionsContainer: HTMLElement = Components.definitionsContainer.cloneNode(true) as HTMLElement;

  // Set max definitions container width
  definitionsContainer.style.maxWidth = maxDefWidth + "px";

  // Generate HTML element and set attributes
  const el: HTMLElement = document.createElement("div");
  el.className = frameStyles.defFrame;
  el.id = "T_A_P_E_WORD" + "_" + frameCount;

  // Order the Types and Definitions components based on quadrant
  if (quadrant === "bottomLeft" || quadrant === "topLeft") {
    definitionsContainer.style.setProperty("padding-right", "17px", "important");
    el.appendChild(typesContainer);
    el.appendChild(definitionsContainer);
  } else {
    definitionsContainer.style.setProperty("padding-left", "17px", "important");
    definitionsContainer.style.alignItems = "flex-end";
    el.appendChild(definitionsContainer);
    el.appendChild(typesContainer);
  }

  // Set SVG filter IDs based on frameCount
  const svgs: SVGElement[] = Array.from(el.getElementsByTagName("svg"));
  svgs.map(setFilterID.bind(frameCount));

  // Populate element with word-type data
  const wordType: string = defs[0]["wordType"];
  const wordTypeEl: HTMLHeadingElement = el.getElementsByClassName(typeStyles.typesLabel)[0] as HTMLHeadingElement;
  wordTypeEl.innerText = wordType;

  return el;
}

export function setFilterID(this: number, svg: SVGElement): SVGElement {
  const direction: string = svg.id.split("Arrow")[0];
  const g: SVGGElement = svg.firstElementChild as SVGGElement;
  const filter: SVGFilterElement = (svg.lastElementChild as SVGDefsElement).firstElementChild as SVGFilterElement;

  g.setAttribute("filter", `url(#filter${direction.charAt(0).toUpperCase()}${direction.substring(1)}${this})`);
  filter.setAttribute("id", `filter${direction.charAt(0).toUpperCase()}${direction.substring(1)}${this}`);

  return svg;
}
