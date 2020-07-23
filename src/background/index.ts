import { browser, Menus, Tabs } from "webextension-polyfill-ts";
import { Definition, Definitions, State } from "../types";

const fetchHeaders = {
  method: "GET",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
  },
};

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
    default:
      return term.split("").slice(0, 4).join("") + ".";
  }
}

async function getDefRes(termString: string): Promise<Response> {
  const endPoint: string = `https://www.lexico.com/en/definition/${termString}`;
  const defRes: Response = await fetch(endPoint, fetchHeaders);
  return Promise.resolve(defRes);
}

async function parseDefRes(defRes: Response): Promise<Definitions> {
  const parser: DOMParser = new DOMParser();
  const resDoc: Document = parser.parseFromString(
    await defRes.text(),
    "text/html"
  );

  // Retrieve the definitions by word types
  let definitions: Definitions = {};

  /**
   * If no exact matches for the term were found, check for nearest result then return that definition
   * If there aren't any near-results, then return empty object.
   */
  const noMatchFound: Element | undefined = resDoc.querySelectorAll(
    "div.no-exact-matches"
  )[0];
  const nearestResult: Element | undefined = resDoc.querySelectorAll(
    "a.no-transition"
  )[0];
  if (nearestResult) {
    const resultString: string = (nearestResult as HTMLAnchorElement).pathname.match(
      /\/definition\/(.*)/
    )![1];
    return Promise.resolve(parseDefRes(await getDefRes(resultString)));
  }
  if (noMatchFound) return Promise.reject(null);

  const wordTypeSections: NodeListOf<Element> = resDoc.querySelectorAll(
    "section.gramb"
  );

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
    const _wordType: string = (wordTypeSection.querySelectorAll(
      "h3.ps.pos > span.pos"
    )[0] as HTMLElement).innerText;

    if (!_wordType) continue;
    const wordType: string = abbreviate(_wordType);
    definitions[wordType] = {
      defs: [],
    };

    /**
     * Check if word type section contains <ul>, "span.ind", and/or "div.crossReference"
     */
    const liElements: NodeListOf<Element> = wordTypeSection.querySelectorAll(
      "ul.semb > li"
    );
    const regularDefEls: NodeListOf<Element> = wordTypeSection.querySelectorAll(
      "p > span.ind"
    );
    const crossRefEls: NodeListOf<Element> = wordTypeSection.querySelectorAll(
      "div.crossReference"
    );

    if (!!liElements.length) {
      if (!!regularDefEls.length) {
        regularDefEls.forEach((rD, i) => {
          // Extract normal definition & example if they exist
          const def: string = (rD as HTMLSpanElement).innerText;
          const exampleContainer = wordTypeSection.querySelectorAll(
            "div.trg > div.exg > div.ex"
          )[i];
          const example: string = exampleContainer
            ? (exampleContainer as HTMLDivElement).innerText
            : "";
          const definition: Definition = { def, example };
          definitions[wordType].defs.push(definition);
        });
      } else if (!!crossRefEls.length) {
        crossRefEls.forEach((cR) => {
          // Extract cross-reference text
          const def: string = (cR as HTMLDivElement).innerText;
          const example = "";
          const definition: Definition = { def, example };
          definitions[wordType].defs.push(definition);
        });
      }
    } else if (!!crossRefEls) {
      crossRefEls.forEach((cR) => {
        // Extract cross-reference text
        const def: string = (cR as HTMLDivElement).innerText;
        const example = "";
        const definition: Definition = { def, example };
        definitions[wordType].defs.push(definition);
      });
    }
  }

  return Promise.resolve(definitions);
}

// FIXME - add context menu only for actual terms (based on computed whitespace)

browser.contextMenus.create({
  id: "WordStar-search",
  title: `Define "%s"`,
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener(
  async (
    info: Menus.OnClickData,
    tab: Tabs.Tab | undefined
  ): Promise<undefined> => {
    if (info.menuItemId === "WordStar-search") {
      const rawSelectionString: string = info.selectionText!.trim();
      const selectionText: string = rawSelectionString.split(" ").join("_");
      const defRes: Response = await getDefRes(selectionText);

      const defs: Definitions = await parseDefRes(defRes).catch((e) => e);

      let state: State | null = null;
      if (defs) {
        state = Object.keys(defs).map((wordType) => ({
          [wordType]: defs[wordType],
        }));
      }

      browser.tabs.sendMessage(tab?.id || 0, state);
    }
    return;
  }
);
