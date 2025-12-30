import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(message) {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const activeTab = tabs[0];
      browser.tabs.sendMessage(activeTab.id, message);
    })
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
