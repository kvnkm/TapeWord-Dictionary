import { DefString, Definition, Definitions, WordTypes } from "../types";

export default async function parseDefRes(defRes: Response): Promise<Definitions> {
  // Create containing shell
  let definitions: Definitions = [];

  const wordTypeSections: NodeListOf<WordTypes> = await getWordTypes(defRes);

  // Return null if there aren't any definitions
  if (!wordTypeSections.length) return Promise.reject(null);

  /**
   * (NORMAL DEFS) Each word-type's section ("section.gramb") will have a <ul> that houses normal defs in <li>s
   *
   * (ABNORMAL DEFS W/ OTHER NORMAL DEFS) For abnormal defs such as cross-references (e.g. "same") that are WITHIN A GROUP of
   * other normal defs, there will be no <ul>s. Their text nodes are inside "div.crossReference"
   *
   * (ABNORMAL DEFS SOLO) For solo cross-references (e.g. "catsup"), their trees are normal, except- text nodes are inside "div.crossReference"
   *  */
  for (const wordTypeSection of wordTypeSections) {
    // Extract word type (e.g. noun, verb, adjective)
    const _wordType: string = (wordTypeSection.querySelectorAll("h3.ps.pos > span.pos")[0] as HTMLElement).innerText;

    if (!_wordType) continue;

    const wordType: string = abbreviate(_wordType);

    // Create Definition object for each new wordType
    if (!definitions.filter((def) => def.wordType === wordType).length) {
      const def: Definition = {
        wordType,
        defStrings: [],
      };
      definitions.push(def);
    }
    // if (!definitions[wordType]) {
    //   definitions[wordType] = [];
    // }

    // Check for definition types (e.g. regular defs, cross-references, empty-senses)
    const liElements: NodeListOf<Element> = wordTypeSection.querySelectorAll("ul.semb > li");
    const crossRefEls: NodeListOf<Element> = wordTypeSection.querySelectorAll("div.crossReference");
    const emptySenseEls: NodeListOf<Element> = wordTypeSection.querySelectorAll("div.empty_sense");

    if (!!liElements.length) {
      // If there is a <li>, then extract the main definition containers
      const regularDefEls = Array.from(liElements, (liEl) => liEl.querySelector("span.ind")).filter((rD) => rD !== null);

      if (!!regularDefEls.length) {
        regularDefEls.forEach((rD, i) => {
          // Extract regular definition & example if they exist
          const def: string = (rD as HTMLSpanElement).innerText;
          const exampleContainer = wordTypeSection.querySelectorAll("div.trg > div.exg > div.ex > em")[i];
          const example: string = exampleContainer ? removeNewLines((exampleContainer as HTMLElement).innerText) : "";
          const defStrings: DefString = { def, example };
          definitions[definitions.length - 1].defStrings.push(defStrings);
        });
      }
    }
    if (!!crossRefEls.length) {
      crossRefEls.forEach((cR) => {
        // Extract cross-reference text
        const def: string = (cR as HTMLElement).innerText;
        const example = "";
        const defStrings: DefString = { def, example };
        definitions[definitions.length - 1].defStrings.push(defStrings);
      });
    }
    if (!!emptySenseEls.length) {
      const derivativeOfEls = Array.from(emptySenseEls, (eS) => eS.querySelector("p.derivative_of")).filter((eS) => eS !== null);
      derivativeOfEls.forEach((dO, i) => {
        // Extract empty-sense text
        const def: string = (dO as HTMLElement).innerText;
        const exampleContainer = wordTypeSection.querySelectorAll("div.exg > div.ex > em")[i];
        const example: string = exampleContainer ? removeNewLines((exampleContainer as HTMLElement).innerText) : "";
        const defStrings: DefString = { def, example };
        definitions[definitions.length - 1].defStrings.push(defStrings);
      });
    }
  }

  return Promise.resolve(definitions);
}

async function getWordTypes(defRes: Response): Promise<NodeListOf<WordTypes>> {
  //
  const parser: DOMParser = new DOMParser();
  const resDoc: Document = parser.parseFromString(await defRes.text(), "text/html");

  const wordTypeSections: NodeListOf<WordTypes> = resDoc.querySelectorAll("section.gramb");

  return Promise.resolve(wordTypeSections);
}

function abbreviate(term: string): string {
  switch (term) {
    case "noun":
      return term;
    case "adjective":
      return "adj.";
    case "adverb":
      return "adv.";
    case "verb":
      return term;
    case "interjection":
      return "interj.";
    case "pronoun":
      return "p.noun";
    case "abbreviation":
      return "abbv.";
    case "cardinal number":
      return "num.";
    case "transitive verb":
      return "verb";
    default:
      return term.split("").slice(0, 4).join("") + ".";
  }
}

function removeNewLines(_string: string): string {
  const newLinesRemoved = _string.replace(/\r?\n|\r/g, "");
  const trimmed = newLinesRemoved.slice(1, _string.length - 1).trim();
  return "'" + trimmed + "'";
}
