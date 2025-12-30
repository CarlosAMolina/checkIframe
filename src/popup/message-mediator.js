import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(message) {
  browser.tabs
    .query({ active: true, currentWindow: true }) // Get current tab.
    .then((tabs) => browser.tabs.sendMessage(tabs[0].id, message))
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
