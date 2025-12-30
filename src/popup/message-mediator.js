import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(tabs, info2sendFromPopup, values2sendFromPopup) {
  const tab = tabs[0];
  const message = {
    info: info2sendFromPopup,
    values: values2sendFromPopup,
  };
  browser.tabs.sendMessage(tab.id, message).catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
