import "../browser-polyfill.js";

import { logError } from "../logger.js";
import { initializePopupButtons } from "./buttons.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";
import { sendMessage } from "./message-mediator.js";
import { Message } from "./model.js";
import { notifyContentScriptOfUrlChange } from "./stored-url-entries.js";
import { saveUrls } from "./stored-url-entries.js";
import { getUrlsInInputBox } from "./ui.js";
import { infoContainer } from "./ui.js";
import { getUrlTypeActive } from "./url.js";

function popupMain() {
  // Display previously saved stored info on start-up
  initializePopup();
  // Set up listener for the input box
  document
    .getElementById("inputUrl")
    .addEventListener("keyup", async function (event) {
      event.preventDefault();
      if (event.key === "Enter") {
        let urls = getUrlsInInputBox();
        urls.pop(); // delete last value (\n)
        await saveUrls(infoContainer, urls, getUrlTypeActive());
      }
    });
}

function initializePopup() {
  setNewElementsMaxWidth();
  initializePopupButtons();
  notifyContentScriptOfUrlChange();
  recheckIfAutomaticDetectionIsOff();
}

async function recheckIfAutomaticDetectionIsOff() {
  const { idAutomaticDetection } = await browser.storage.local.get({
    idAutomaticDetection: true,
  });
  if (!idAutomaticDetection) {
    sendMessage(new Message("buttonRecheck")).catch(logError);
  }
}

// there was an error executing the script.
// display the pop-up's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
  logError(`Failed to check this web page: ${error.message}`);
  updateElementsWhenIncompatibleWebPage();
  popupMain();
}

export const _forTesting = {
  popupMain,
  initializePopup,
  recheckIfAutomaticDetectionIsOff,
  reportExecuteScriptError,
  logError,
  saveUrls,
};

try {
  popupMain();
} catch (error) {
  reportExecuteScriptError(error);
}
