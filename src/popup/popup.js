import { getUrlTypeActive } from "./url.js";
import { getUrlsInInputBox } from "./ui.js";
import { infoContainer } from "./ui.js";
import { initializePopupButtons } from "./buttons.js";
import { notifyContentScriptOfUrlChange } from "./stored-url-entries.js";
import { reportError } from "./log.js";
import { saveUrls } from "./stored-url-entries.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

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
}

// there was an error executing the script.
// display the pop-up's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
  reportError(`Failed to check this web page: ${error.message}`);
  updateElementsWhenIncompatibleWebPage();
  popupMain();
}

try {
  popupMain();
} catch (error) {
  reportExecuteScriptError(error);
}
