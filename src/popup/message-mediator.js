import { SUPPORTED_PROTOCOLS } from "../constants.js";
import { reportError } from "./log.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

function getProtocol(url) {
  try {
    return new URL(url).protocol;
  } catch (error) {
    return "";
  }
}

function isProtocolSupported(url) {
  const protocol = getProtocol(url);
  return SUPPORTED_PROTOCOLS.includes(protocol);
}

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
  reportError(error);
  updateElementsWhenIncompatibleWebPage();
}
