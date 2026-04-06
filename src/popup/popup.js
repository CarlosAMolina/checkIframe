import { ButtonAlwaysShowSources } from "./buttons.js";
import { BUTTON_ID_ALWAYS_SHOW_SOURCES } from "./buttons.js";
import { createButton } from "./buttons.js";
import { getIdHtmlClicked } from "./dom.js";
import { getStoredUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { initializePopupButtons } from "./buttons.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { saveUrl } from "./buttons.js";
import { sendMessage } from "./message-mediator.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { setUrls } from "./url.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace all `var` in all files with let or const.

function popupMain() {
  // display previously saved stored info on start-up
  initializePopup();

  // listen to clicks on the buttons, and send the appropriate message to
  // the content script in the web page.
  document.addEventListener("click", (e) => {
    let buttonIdHtml = getIdHtmlClicked(e);
    let button = createButton(buttonIdHtml);
    if (button) {
      button.click();
    }
  });
  // TODO test button is clickable.
  // TODO move to buttons.js
  document
    .getElementById(BUTTON_ID_ALWAYS_SHOW_SOURCES)
    .addEventListener("click", () => {
      new ButtonAlwaysShowSources().click();
    });
  const urlType = getUrlTypeActive();
  // set up listener for the input box
  document
    .getElementById("inputUrl")
    .addEventListener("keyup", function (event) {
      event.preventDefault();
      const enterKey = 13;
      if (event.keyCode === enterKey) {
        saveUrl(1, urlType);
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
