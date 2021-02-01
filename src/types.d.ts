export interface DefString {
  def: string;
  example: string;
}

export interface Definition {
  wordType: string;
  defStrings: DefString[];
}

export type Definitions = Definition[];

export interface Styles {
  [selector: string]: {
    [property: string]: string;
  };
}

export type Quadrant = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type RenderType = "initial" | "error" | "prevType" | "nextType" | "prevDef" | "nextDef";

export interface WordTypes extends HTMLTableSectionElement {
  className: "gramb";
}

export interface Frame {
  id: string;
  wordTypeIndex: number;
  defsIndex: number[];
  defs: Definitions;
  render: (this: Frame, renderType: RenderType) => void;
  element: HTMLElement;
  selectionBox: DOMRect;
  quadrant: Quadrant;
}
