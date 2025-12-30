import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(tabs, info2sendFromPopup, values2sendFromPopup) {
  browser.tabs
    .sendMessage(tabs[0].id, {
      info: info2sendFromPopup,
      values: values2sendFromPopup,
    })
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
