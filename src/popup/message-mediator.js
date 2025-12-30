import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(tabs, message) {
  const tab = tabs[0];
  browser.tabs.sendMessage(tab.id, message).catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
