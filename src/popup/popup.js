import { BUTTON_ID_CLEAN } from "./buttons.js";
import { BUTTON_ID_RECHECK } from "./buttons.js";
import { BrowserRepository } from "./repository.js";
import { Button } from "./buttons.js";
import { ButtonCancel } from "./buttons.js";
import { ButtonClean } from "./buttons.js";
import { ButtonDelete } from "./buttons.js";
import { ButtonHighlightAllAutomatically } from "./buttons.js";
import { ButtonRecheck } from "./buttons.js";
import { ButtonShowLogs } from "./buttons.js";
import { DynamicButton } from "./buttons.js";
import { Message } from "./model.js";
import { addUrl } from "./url.js";
import { cleanShowSources } from "./ui.js";
import { deleteUrl } from "./url.js";
import { getIdHtmlClicked } from "./dom.js";
import { getStoredUrls } from "./url.js";
import { getStrTagsHtml } from "./tags-html.js";
import { getUrlTypeActive } from "./url.js";
import { getUrls } from "./url.js";
import { infoContainer } from "./ui.js";
import { removeChildren } from "./dom.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setNewElementsMaxWidth } from "./dom.js";
import { setUrls } from "./url.js";
import { setupCopyButtonListeners } from "./buttons.js";
import { sourcesContainer } from "./ui.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace all `var` in this file with let or const.

const BUTTON_ID_ADD_URL = "buttonAddUrl";
const BUTTON_ID_CLEAR_ALL = "buttonClearAll";
const BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY = "buttonHighlightAllAutomatically";
const BUTTON_ID_SCROLL = "buttonScroll";
const BUTTON_ID_SHOW_CONFIG = "buttonShowConfig";
const BUTTON_ID_SHOW_LOGS = "buttonShowLogs";
const BUTTON_ID_SHOW_SOURCES = "buttonShowSources";
const BUTTON_ID_URLS_BLACKLIST = "buttonUrlsBlacklist";
const BUTTON_ID_URLS_NOTIFY = "buttonUrlsNotify";
const BUTTON_ID_URLS_REFERER = "buttonUrlsReferer";
const HTML_ID_SOURCES_CONFIG = "sourcesConfigValues";
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
  getStoredUrls(browser).then((urls) => {
    setUrls(urls);
    const message = Message("urls", urls);
    sendMessage(message);
  }, reportError);
}

//TODO move createButton and all buttons to button.js and update tests.
//TODO improve, instead of liste to all clicked elements, add listen only to buttons.
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

class ButtonUpdate extends DynamicButton {
  constructor(entry, entryEditInput, storageKey, storageValue) {
    super();
    this._entry = entry;
    this._entryEditInput = entryEditInput;
    this._repository = new BrowserRepository(browser);
    this._storageKey = storageKey;
    this._storageValue = storageValue;
  }

  static createDom() {
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = '<img src="/icons/ok.svg" alt="Update"/>';
    updateBtn.setAttribute("title", "Update");
    return updateBtn;
  }

  click() {
    if (this._info2save === this._storageValue) {
      return;
    }
    this._repository.getByKey(this._key2save).then((result) => {
      // result: empty object if the searched value is not stored
      if (Object.keys(result).length == 0) {
        this._updateEntry();
        this._entry.parentNode.removeChild(this._entry);
      }
    });
  }

  get _info2save() {
    return this._entryEditInput.value;
  }

  get _key2save() {
    return this._storageKey.split("_")[0] + "_" + this._info2save;
  }

  _updateEntry() {
    const urlType = getUrlTypeActive();
    let urls = getUrls();
    urls = addUrl(this._key2save, urls, urlType);
    this._repository.save(this._key2save, this._info2save).then(() => {
      urls = deleteUrl(this._storageKey, urls, urlType);
      this._repository.delete(this._storageKey).then(() => {
        showStoredInfo(this._key2save, this._info2save);
      }, reportError);
    }, reportError);
    sendMessage(Message("urls", urls));
    setUrls(urls);
  }
}

class ButtonScroll extends Button {
  get _idHtml() {
    return BUTTON_ID_SCROLL;
  }

  click() {
    this._logButtonName();
    const htmlIdToChange = "infoScroll";
    unhide(htmlIdToChange);
    const message = Message(this._idHtml);
    return sendMessage(message)
      .then((response) =>
        changeParagraph(message.info, response.response, htmlIdToChange),
      )
      .catch(reportError);
  }
}

class ButtonShowSources extends Button {
  get _idHtml() {
    return BUTTON_ID_SHOW_SOURCES;
  }

  click() {
    this._logButtonName();
    const htmlIdToChange = "infoTags";
    toggleHide(htmlIdToChange);
    // TODO? avoid send message when hidding
    const message = Message(this._idHtml);
    return sendMessage(message)
      .then((response) =>
        changeParagraph(message.info, response.response, htmlIdToChange),
      )
      .catch(reportError);
  }
}

class ButtonShowConfig extends Button {
  get _idHtml() {
    return BUTTON_ID_SHOW_CONFIG;
  }

  click() {
    this._logButtonName();
    toggleHide("menuConfig");
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

function showStoredInfo(storageKey, storageValue) {
  // display box
  const entryDisplay = document.createElement("div");
  entryDisplay.setAttribute("class", "section sourceConfig");
  const deleteBtn = ButtonDelete.createDom();
  entryDisplay.appendChild(deleteBtn);
  const entryValue = document.createElement("p");
  entryValue.textContent = storageValue;
  entryDisplay.appendChild(entryValue);
  const entry = document.createElement("div");
  entry.appendChild(entryDisplay);

  // edit box
  const entryEdit = document.createElement("div");
  entryEdit.setAttribute("class", "section sourceConfig");
  const entryEditInput = document.createElement("input");
  entryEdit.appendChild(entryEditInput);
  const updateBtn = ButtonUpdate.createDom();
  entryEdit.appendChild(updateBtn);
  const cancelBtn = ButtonCancel.createDom();
  entryEdit.appendChild(cancelBtn);
  entry.appendChild(entryEdit);
  entryEditInput.value = storageValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  deleteBtn.addEventListener("click", (e) => {
    new ButtonDelete(e, storageKey).click();
  });

  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    new ButtonCancel(entryDisplay, entryEdit).click();
  });

  updateBtn.addEventListener("click", () => {
    new ButtonUpdate(entry, entryEditInput, storageKey, storageValue).click();
  });
}

function showStoredUrlsType(urlType) {
  new BrowserRepository(browser).getAll().then((storageItems) => {
    var keys = Object.keys(storageItems);
    keys.forEach(function (key) {
      if (key.includes(urlType + "_")) {
        showStoredInfo(key, storageItems[key]);
      }
    });
  }, reportError);
}

function changeParagraph(info2sendFromPopup, response, htmlId) {
  if (response === undefined) {
    document.getElementById(htmlId).textContent =
      "Internal error. The action could not be executed";
    return;
  }
  // check if the content-script response has been received
  if (info2sendFromPopup === "buttonScroll") {
    document.getElementById(htmlId).textContent = response;
    return;
  }
  if (info2sendFromPopup === "buttonShowSources") {
    cleanShowSources();
    const frameTagSummary = response["frame"];
    const iframeTagSummary = response["iframe"];
    const htmlStr = getStrTagsHtml(frameTagSummary, iframeTagSummary);
    sourcesContainer.insertAdjacentHTML("afterbegin", htmlStr);
    setupCopyButtonListeners();
    return;
  }
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
      showStoredInfo(id2save, value2save);
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
