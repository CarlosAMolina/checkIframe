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
import { HTML_ID_SOURCES_CONFIG } from "./buttons.js";
import { BrowserRepository } from "./repository.js";
import { Button } from "./buttons.js";
import { ButtonClean } from "./buttons.js";
import { ButtonHighlightAllAutomatically } from "./buttons.js";
import { ButtonRecheck } from "./buttons.js";
import { ButtonScroll } from "./buttons.js";
import { ButtonShowConfig } from "./buttons.js";
import { ButtonShowLogs } from "./buttons.js";
import { Message } from "./model.js";
import { OnOffButton } from "./buttons.js";
import { addUrl } from "./url.js";
import { getIdHtmlClicked } from "./dom.js";
import { getStoredUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrls } from "./url.js";
import { hide } from "./dom.js";
import { infoContainer } from "./ui.js";
import { isHidden } from "./dom.js";
import { removeChildren } from "./dom.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { setShowSourcesError } from "./ui.js";
import { setUrls } from "./url.js";
import { showSources } from "./ui.js";
import { showStoredInfo } from "./buttons.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace all `var` in this file with let or const.

var URL_TYPE_BLACKLIST = "blacklist"; // TODO rm, moved to url.js
var URL_TYPE_NOTIFY = "notify"; // TODO rm, moved to url.js
var URL_TYPE_REFERER = "referer"; // TODO rm, moved to url.js

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
      return new ButtonUrlsNotify();
    case BUTTON_ID_URLS_BLACKLIST:
      return new ButtonUrlsBlacklist();
    case BUTTON_ID_URLS_REFERER:
      return new ButtonUrlsReferer();
    case BUTTON_ID_ADD_URL:
      return new ButtonAddUrl();
    case BUTTON_ID_CLEAR_ALL:
      return new ButtonClearAll();
    default:
      return false;
  }
}

class ButtonShowSources extends Button {
  get _idHtml() {
    return BUTTON_ID_SHOW_SOURCES;
  }

  click() {
    this._logButtonName();
    toggleHide("infoTags");
    return this.showSources();
  }

  showSources() {
    // TODO? avoid send message when hidding
    const message = Message(this._idHtml);
    return sendMessage(message)
      .then((response) => {
        // Manage content-script response.
        const tagSummary = response.response;
        showSources(tagSummary);
      })
      .catch(setShowSourcesError);
  }
}

export class ButtonAlwaysShowSources extends OnOffButton {
  constructor() {
    super();
    this._button = new ButtonShowSources();
  }

  get _idHtml() {
    return BUTTON_ID_ALWAYS_SHOW_SOURCES;
  }

  async click() {
    this._logButtonName();
    if (this.isOn) {
      this.setStyleOff();
      if (this._canThePageBeAnalyzed()) {
        unhide("buttonShowSources");
      }
    } else {
      this.setStyleOn();
      if (this._canThePageBeAnalyzed()) {
        hide("buttonShowSources");
        await this._showSources();
      }
    }
    await browser.storage.local
      .set({ [this._idStorage]: this.isOn })
      .then(() => {
        console.log(
          `The following value has been stored for ${this._idStorage}: ${this.isOn}`,
        );
      }, console.error);
  }

  async initializePopup() {
    const mustBeOn = await this.getIsStoredOn();
    if (mustBeOn) {
      // TODO refactor, extract method, duplicated code.
      this.setStyleOn();
      if (this._canThePageBeAnalyzed()) {
        hide("buttonShowSources");
        await this._showSources();
      }
    } else {
      this.setStyleOff();
    }
  }

  get _idStorage() {
    return "idTagsInfoAlwaysVisible";
  }

  _canThePageBeAnalyzed() {
    return isHidden("error-content");
  }

  async _showSources() {
    await this._button.showSources();
    unhide("infoTags");
  }
}

class UrlsOfTypeButton extends Button {
  get _urlType() {
    throw TypeError("Not implemented");
  }

  click() {
    this._logButtonName();
    unhide(HTML_ID_SOURCES_CONFIG);
    removeShownStoredUrls();
    showStoredUrlsType(this._urlType);
  }
}

class ButtonUrlsNotify extends UrlsOfTypeButton {
  get _idHtml() {
    return BUTTON_ID_URLS_NOTIFY;
  }

  get _urlType() {
    return URL_TYPE_NOTIFY;
  }
}

class ButtonUrlsBlacklist extends UrlsOfTypeButton {
  get _idHtml() {
    return BUTTON_ID_URLS_BLACKLIST;
  }

  get _urlType() {
    return URL_TYPE_BLACKLIST;
  }
}

class ButtonUrlsReferer extends UrlsOfTypeButton {
  get _idHtml() {
    return BUTTON_ID_URLS_REFERER;
  }

  get _urlType() {
    return URL_TYPE_REFERER;
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

function showStoredUrlsType(urlType) {
  new BrowserRepository(browser).getAll().then((storageItems) => {
    var keys = Object.keys(storageItems);
    keys.forEach(function (key) {
      if (key.includes(urlType + "_")) {
        showStoredInfo(infoContainer, key, storageItems[key]);
      }
    });
  }, reportError);
}

function removeShownStoredUrls() {
  removeChildren(infoContainer);
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
  function saveInfo(id2save, value2save) {
    let urls = getUrls();
    urls = addUrl(id2save, urls, urlType);
    setUrls(urls);
    const message = Message("urls", urls);
    sendMessage(message);
    repository.save(id2save, value2save).then(() => {
      showStoredInfo(infoContainer, id2save, value2save);
    }, reportError);
  }
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
        saveInfo(id2save, arrayValue);
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
