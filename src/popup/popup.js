import { addUrl } from "./url.js";
import { BrowserRepository } from "./repository.js";
import { ButtonAlwaysShowSources } from "./buttons.js";
import { ButtonClean } from "./buttons.js";
import { Button } from "./buttons.js";
import { ButtonHighlightAllAutomatically } from "./buttons.js";
import { BUTTON_ID_ADD_URL } from "./buttons.js";
import { BUTTON_ID_ALWAYS_SHOW_SOURCES } from "./buttons.js";
import { BUTTON_ID_CLEAN } from "./buttons.js";
import { BUTTON_ID_CLEAR_ALL } from "./buttons.js";
import { BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY } from "./buttons.js";
import { BUTTON_ID_RECHECK } from "./buttons.js";
import { BUTTON_ID_SCROLL } from "./buttons.js";
import { BUTTON_ID_SHOW_CONFIG } from "./buttons.js";
import { BUTTON_ID_SHOW_LOGS } from "./buttons.js";
import { BUTTON_ID_SHOW_SOURCES } from "./buttons.js";
import { BUTTON_ID_URLS_BLACKLIST } from "./buttons.js";
import { BUTTON_ID_URLS_NOTIFY } from "./buttons.js";
import { BUTTON_ID_URLS_REFERER } from "./buttons.js";
import { ButtonRecheck } from "./buttons.js";
import { ButtonScroll } from "./buttons.js";
import { ButtonShowConfig } from "./buttons.js";
import { ButtonShowLogs } from "./buttons.js";
import { ButtonShowSources } from "./buttons.js";
import { ButtonUrlsBlacklist } from "./buttons.js";
import { ButtonUrlsNotify } from "./buttons.js";
import { ButtonUrlsReferer } from "./buttons.js";
import { getIdHtmlClicked } from "./dom.js";
import { getStoredUrls } from "./url.js";
import { getUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { infoContainer } from "./ui.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { setUrls } from "./url.js";
import { showStoredInfo } from "./buttons.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace all `var` in this file with let or const.

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
  new ButtonShowLogs().initializePopup();
  new ButtonHighlightAllAutomatically().initializePopup();
  new ButtonAlwaysShowSources().initializePopup();
  getStoredUrls(browser).then((urls) => {
    setUrls(urls);
    const message = Message("urls", urls);
    sendMessage(message);
  }, reportError);
}

//TODO move createButton and all buttons to button.js and update tests.
//TODO improve, instead of list all clicked elements, add listen only to buttons.
function createButton(buttonIdHtml) {
  switch (buttonIdHtml) {
    case BUTTON_ID_RECHECK:
      return new ButtonRecheck();
    case BUTTON_ID_CLEAN:
      return new ButtonClean();
    case BUTTON_ID_SCROLL:
      return new ButtonScroll();
    case BUTTON_ID_SHOW_SOURCES:
      return new ButtonShowSources();
    case BUTTON_ID_SHOW_CONFIG:
      return new ButtonShowConfig();
    case BUTTON_ID_SHOW_LOGS:
      return new ButtonShowLogs();
    case BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY:
      return new ButtonHighlightAllAutomatically();
    case BUTTON_ID_URLS_NOTIFY:
      return new ButtonUrlsNotify(infoContainer);
    case BUTTON_ID_URLS_BLACKLIST:
      return new ButtonUrlsBlacklist(infoContainer);
    case BUTTON_ID_URLS_REFERER:
      return new ButtonUrlsReferer(infoContainer);
    case BUTTON_ID_ADD_URL:
      return new ButtonAddUrl();
    case BUTTON_ID_CLEAR_ALL:
      return new ButtonClearAll();
    default:
      return false;
  }
}

class ButtonAddUrl extends Button {
  get _idHtml() {
    return BUTTON_ID_ADD_URL;
  }

  click() {
    this._logButtonName();
    const urlType = getUrlTypeActive();
    saveUrl(undefined, urlType);
  }
}

class ButtonClearAll extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAR_ALL;
  }

  click() {
    this._logButtonName();
    const urlType = getUrlTypeActive();
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then(() => this._clearStorageInfo(urlType))
      .catch(reportError);
  }

  _clearStorageInfo(urlType) {
    const repository = new BrowserRepository(browser);
    return repository.getAll().then((storageItems) => {
      const keysUrl = Object.keys(storageItems).filter((key) =>
        key.includes(urlType + "_"),
      );
      keysUrl.forEach(() => {
        // TODO? use removeShownStoredUrls
        infoContainer.removeChild(infoContainer.firstChild);
      });
      const deletePromises = keysUrl.map((keyUrl) => {
        return repository.delete(keyUrl);
      });
      return Promise.all(deletePromises).then(() => {
        return getStoredUrls(browser).then((storedUrls) => {
          setUrls(storedUrls);
          const message = Message("urls", storedUrls);
          sendMessage(message);
          return storedUrls;
        }, reportError);
      }, reportError);
    }, reportError);
  }
}

// save input box info
function saveUrl(enterKey, urlType) {
  let info2save = document
    .querySelector('textarea[id="inputUrl"]')
    .value.split("\n");
  if (enterKey == 1) {
    info2save.pop(); // delete last value (\n)
  }
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(() => storeInfo(info2save, urlType))
    .catch(reportError);
}

// add a tag to the display, and storage
function storeInfo(info2save, urlType) {
  const repository = new BrowserRepository(browser);
  info2save = info2save.filter(function (value, position) {
    // delete duplicates
    return info2save.indexOf(value) == position;
  });
  info2save.forEach(function (arrayValue) {
    var id2save = urlType + "_" + arrayValue;
    repository.getByKey(id2save).then((result) => {
      // result: empty object if the searched value is not stored
      var searchInStorage = Object.keys(result); // array with the searched value if it is stored
      if (searchInStorage.length < 1) {
        // searchInStorage.length < 1 -> no stored;
        let urls = getUrls();
        urls = addUrl(id2save, urls, urlType);
        setUrls(urls);
        const message = Message("urls", urls);
        sendMessage(message);
        repository.save(id2save, arrayValue).then(() => {
          showStoredInfo(infoContainer, id2save, arrayValue);
        }, reportError);
      }
    }, reportError);
  });
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
