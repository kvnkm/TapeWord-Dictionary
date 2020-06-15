import { browser, Menus, Tabs } from "webextension-polyfill-ts";

export interface Definition extends Response {
  entry: string;
  request: string;
  response: string;
  meaning: {
    noun: string;
    verb: string;
    adverb: string;
    adjective: string;
  };
  ipa: string;
  version: string;
  author: string;
  email: string;
  result_code: string;
  result_msg: string;
}

async function fetchDef(term: string): Promise<Response> {
  const endPoint: string = `https://twinword-word-graph-dictionary.p.rapidapi.com/definition/?entry=${term}`;

  const headers = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "twinword-word-graph-dictionary.p.rapidapi.com",
      "x-rapidapi-key": "d269648a61msh5775ca37a0c33f1p1bdcdejsnc2172aada844",
    },
  };
  const res: Definition = await (await fetch(endPoint, headers)).json();
  return res;
}

browser.contextMenus.create({
  id: "WordStar-search",
  title: `Define "%s"`,
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener(
  (info: Menus.OnClickData, tab: Tabs.Tab | undefined): void => {
    if (info.menuItemId === "WordStar-search") {
      console.log(info);
      const selectionText: string = info.selectionText!.trim();
      fetchDef(selectionText).then((res) => {
        browser.tabs.sendMessage(tab?.id || 0, res);
      });
    }
  }
);
