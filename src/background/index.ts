import { browser, Menus, Tabs } from "webextension-polyfill-ts";

interface Definition {
  def: string;
  example: string;
}

export interface Definitions {
  [wordType: string]: Definition[];
}

const fetchHeaders = {
  method: "GET",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
  },
};

async function getDefRes(termString: String): Promise<Response> {
  const endPoint: string = `https://cors-anywhere.herokuapp.com/https://www.lexico.com/en/definition/${termString}`;
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
  let wordTypes: Definitions = {};

  /**
   * If no exact matches for the term were found, check for nearest result then return that definition
   * If there are no nearest results, then return empty object
   */
  const noMatchFound: Element | undefined = resDoc.querySelectorAll(
    "div.no-exact-matches"
  )[0];
  const nearestResult: Element | undefined = resDoc.querySelectorAll(
    "a.no-transition"
  )[0];
  if (nearestResult) {
    console.log(nearestResult);
    const resultString: String = (nearestResult as HTMLAnchorElement).innerText;
    return Promise.resolve(parseDefRes(await getDefRes(resultString)));
  }
  if (noMatchFound) return Promise.resolve(wordTypes);

  const wordTypeSections: NodeListOf<Element> = resDoc.querySelectorAll(
    "section.gramb"
  );
  wordTypeSections.forEach((wordTypeSection) => {
    const wordType: string = (wordTypeSection.querySelectorAll(
      "h3.ps.pos > span.pos"
    )[0] as HTMLElement).innerText;
    wordTypes[wordType] = [];

    const definitionElements: NodeListOf<Element> = wordTypeSection.querySelectorAll(
      "ul.semb > li"
    );
    definitionElements.forEach((defEl) => {
      // Continue to next iteration if it's not a real definition
      const listCheck: NodeListOf<Element> | [] = defEl.querySelectorAll(
        "p > span.ind"
      );
      if (listCheck === undefined || listCheck.length == 0) return;

      // Extract the definition and example strings
      const def: string = (defEl.querySelectorAll(
        "p > span.ind"
      )[0] as HTMLSpanElement)["innerText"];
      const exampleContainer = defEl.querySelectorAll("div.exg > div.ex")[0];
      const example: string = exampleContainer
        ? (exampleContainer as HTMLDivElement).innerText
        : "";
      const definition: Definition = { def, example };
      wordTypes[wordType].push(definition);
    });
  });

  return Promise.resolve(wordTypes);
}

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

      const defs: Definitions = await parseDefRes(defRes);
      let msg: Definitions | null;
      Object.keys(defs).length === 0 ? (msg = null) : (msg = defs);

      browser.tabs.sendMessage(tab?.id || 0, msg);
    }
    return;
  }
);
