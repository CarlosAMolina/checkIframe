import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO drop New and drop old sendMessage
export function sendMessageNew(message) {
  browser.tabs
    .query({ active: true, currentWindow: true }) // Send to current tab.
    .then((tabs) => browser.tabs.sendMessage(tabs[0].id, message))
    .catch(reportError); // TODO use onSendInfoError
}

export function sendMessage(tab, message) {
  browser.tabs.sendMessage(tab.id, message).catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
