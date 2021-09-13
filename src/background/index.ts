import { browser, Menus, Tabs } from "webextension-polyfill-ts";
import { Definitions } from "../types";
import parseDefRes from "./parseDefRes";
import getDefRes from "./getDefRes";

browser.contextMenus.create({
  id: "TapeWord-search",
  title: `Define "%s"`,
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener(
  async (info: Menus.OnClickData, tab: Tabs.Tab | undefined): Promise<void> => {
    if (info.menuItemId === "TapeWord-search") {
      // Have the content-script capture the selectionBox immediately upon click
      browser.tabs.sendMessage(tab?.id || 0, "getSelectionBox");

      const selectionText: string = info.selectionText!.trim().split(" ").join("_").toLowerCase();
      let defs: Definitions | null;
      const defRes: Response = await getDefRes(selectionText).catch((e) => e);

      defs = defRes.status === 200 ? await parseDefRes(defRes).catch((e) => e) : null;

      browser.tabs.sendMessage(tab?.id || 0, defs);
    }
    return;
  }
);
