import { browser, Menus, Tabs } from "webextension-polyfill-ts";
import { Definitions, State } from "../types";
import parseDefRes from "./parseDefRes";
import getDefRes from "./getDefRes";

/**
 * FIXME
 * add context menu only for actual terms (based on computed whitespace)
 */

browser.contextMenus.create({
  id: "TapeWord-search",
  title: `Define "%s"`,
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener(
  async (
    info: Menus.OnClickData,
    tab: Tabs.Tab | undefined
  ): Promise<undefined> => {
    if (info.menuItemId === "TapeWord-search") {
      // Have the content-script capture the selectionBox immediately upon click
      browser.tabs.sendMessage(tab?.id || 0, "getSelectionBox");

      const selectionText: string = info
        .selectionText!.trim()
        .split(" ")
        .join("_")
        .toLowerCase();

      let defs: Definitions | null = null;

      const defRes: Response = await getDefRes(selectionText).catch((e) => e);
      if (!(defRes instanceof TypeError)) {
        defs = await parseDefRes(defRes).catch((e) => e);
      }

      let _state: Definitions[] | null = defs
        ? Object.keys(defs).map((wordType) => ({
            [wordType]: defs![wordType],
          }))
        : null;

      browser.tabs.sendMessage(tab?.id || 0, _state);
    }
    return;
  }
);
