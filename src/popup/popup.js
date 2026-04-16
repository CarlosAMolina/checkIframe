import { Message } from "./model.js";
import { getStoredUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrlsInInputBox } from "./ui.js";
import { infoContainer } from "./ui.js";
import { initializePopupButtons } from "./buttons.js";
import { reportError } from "./log.js";
import { saveUrls } from "./buttons.js";
import { sendMessage } from "./message-mediator.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { setUrls } from "./url.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace all `var` in all files with let or const.

function popupMain() {
  // Display previously saved stored info on start-up
  initializePopup();
  const urlType = getUrlTypeActive();
  // Set up listener for the input box
  document
    .getElementById("inputUrl")
    .addEventListener("keyup", async function (event) {
      event.preventDefault();
      const enterKey = 13;
      if (event.keyCode === enterKey) {
        let urls = getUrlsInInputBox();
        urls.pop(); // delete last value (\n)
        await saveUrls(infoContainer, urls, urlType);
      }
    });
}

function initializePopup() {
  setNewElementsMaxWidth();
  initializePopupButtons();
  getStoredUrls(browser).then((urls) => {
    setUrls(urls);
    const message = Message("urls", urls);
    sendMessage(message);
  }, reportError);
}

// there was an error executing the script.
// display the pop-up's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
  reportError(`Failed to check this web page: ${error.message}`);
  updateElementsWhenIncompatibleWebPage();
  popupMain();
}

// when the pop-up loads, inject a content script into the active tab,
// and add a click handler.
// if we couldn't inject the script, handle the error.
browser.tabs
  .executeScript({ file: "../content_scripts/check-and-border.js" })
  .then(popupMain)
  .catch(reportExecuteScriptError);
