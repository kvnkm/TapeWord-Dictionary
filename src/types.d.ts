export interface Definition {
  def: string;
  example: string;
  selected: Boolean;
}

export interface Definitions {
  [wordType: string]: {
    selected: Boolean;
    defs: Definition[];
  };
}

export type State = Definitions[];

export interface Styles {
  [selector: string]: {
    [property: string]: string;
  };
}
