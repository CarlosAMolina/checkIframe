import { logError } from "../logger.js";
import { isProtocolSupported } from "../supported-protocols.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

export function sendMessage(message) {
  return browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const activeTab = tabs[0];
      if (!isProtocolSupported(activeTab.url)) {
        updateElementsWhenIncompatibleWebPage();
        return Promise.resolve();
      }
      return browser.tabs.sendMessage(activeTab.id, message);
    })
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  logError(error);
  updateElementsWhenIncompatibleWebPage();
}
