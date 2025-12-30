import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendInfo(tabs, info2sendFromPopup, values2sendFromPopup) {
  browser.tabs
    .sendMessage(tabs[0].id, {
      info: info2sendFromPopup,
      values: values2sendFromPopup,
    })
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  console.error(error);
  updateElementsWhenIncompatibleWebPage();
}
