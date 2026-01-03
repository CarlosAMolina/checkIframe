import { BrowserRepository } from "./repository.js";
import { Button } from "./buttons.js";
import { ButtonHighlightAllAutomatically } from "./buttons.js";
import { ButtonShowLogs } from "./buttons.js";
import { DynamicButton } from "./buttons.js";
import { Message } from "./model.js";
import { addUrl } from "./url.js";
import { deleteUrl } from "./url.js";
import { getStoredUrls } from "./url.js";
import { getStrTagsHtml } from "./tags-html.js";
import { getUrls } from "./url.js";
import { hide } from "./dom.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setUrls } from "./url.js";
import { setupCopyButtonListeners } from "./buttons.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";
import { updateElementsWhenIncompatibleWebPage } from "./dom.js";

// TODO replace var in this file with let or const.

// TODO var as const
var infoContainer = document.querySelector(".info-container");
// TODO var as const
var sourcesContainer = document.querySelector(".sources-container");

const BUTTON_ID_ADD_URL = "buttonAddUrl";
const BUTTON_ID_CLEAN = "buttonClean";
const BUTTON_ID_CLEAR_ALL = "buttonClearAll";
const BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY = "buttonHighlightAllAutomatically";
const BUTTON_ID_RECHECK = "buttonRecheck";
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
    let buttonIdHtml = getIdHtmlOfClickedButtonOrImageFromEventClick(e);
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
      // enter key
      if (event.keyCode === 13) {
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

// This is necessay to avoid changes in the pop-up width.
function setNewElementsMaxWidth() {
  const maxWidthCurrentWindow =
    document.getElementById("buttonShowConfig").offsetWidth;
  const widthToReduceToAvoidVisualSizeChange = 5;
  const maxWidthNewElements =
    maxWidthCurrentWindow - widthToReduceToAvoidVisualSizeChange;
  const maxWidthNewElementsStr = `${maxWidthNewElements}px`;
  const htmlIdsToModify = ["infoScroll", "menuConfig", "infoTags"];
  for (const htmlId of htmlIdsToModify) {
    document.getElementById(htmlId).style.maxWidth = maxWidthNewElementsStr;
  }
}

function getIdHtmlOfClickedButtonOrImageFromEventClick(eventClick) {
  return eventClick.target.id || eventClick.target.parentElement.id;
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

class ButtonCancel extends DynamicButton {
  constructor(entryDisplay, entryEdit, entryEditInput, eValue) {
    super();
    this._entryDisplay = entryDisplay;
    this._entryEdit = entryEdit;
    this._entryEditInput = entryEditInput;
    this._eValue = eValue;
  }

  get _idHtml() {
    return "buttonCancel";
  }

  static createInDom() {
    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<img src="/icons/cancel.svg" alt="Cancel update"/>';
    cancelBtn.setAttribute("title", "Cancel update");
    return cancelBtn;
  }

  click() {
    this.logButtonName();
    this._entryDisplay.style.display = "";
    this._entryEdit.style.display = "none";
    // TODO the next line is necessary?
    this._entryEditInput.value = this._eValue;
  }
}

class ButtonRecheck extends Button {
  get _idHtml() {
    return BUTTON_ID_RECHECK;
  }

  click() {
    this.logButtonName();
    hide("infoTags");
    const message = Message(this._idHtml);
    sendMessage(message);
  }
}

class ButtonClean extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAN;
  }

  click() {
    this.logButtonName();
    hide("infoScroll");
    const message = Message(this._idHtml);
    sendMessage(message);
  }
}

class ButtonScroll extends Button {
  get _idHtml() {
    return BUTTON_ID_SCROLL;
  }

  click() {
    this.logButtonName();
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
    this.logButtonName();
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
    this.logButtonName();
    toggleHide("menuConfig");
  }
}

class ButtonUrlsNotify extends Button {
  get _idHtml() {
    return BUTTON_ID_URLS_NOTIFY;
  }

  click() {
    this.logButtonName();
    unhide(HTML_ID_SOURCES_CONFIG);
    removeShownStoredUrls();
    const urlType = URL_TYPE_NOTIFY;
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonUrlsBlacklist extends Button {
  get _idHtml() {
    return BUTTON_ID_URLS_BLACKLIST;
  }

  click() {
    this.logButtonName();
    unhide(HTML_ID_SOURCES_CONFIG);
    removeShownStoredUrls();
    const urlType = URL_TYPE_BLACKLIST;
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonUrlsReferer extends Button {
  get _idHtml() {
    return BUTTON_ID_URLS_REFERER;
  }

  click() {
    this.logButtonName();
    unhide(HTML_ID_SOURCES_CONFIG);
    removeShownStoredUrls();
    const urlType = URL_TYPE_REFERER;
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonAddUrl extends Button {
  get _idHtml() {
    return BUTTON_ID_ADD_URL;
  }

  click() {
    this.logButtonName();
    const urlType = getUrlTypeActive();
    saveUrl(undefined, urlType);
  }
}

class ButtonClearAll extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAR_ALL;
  }

  click() {
    this.logButtonName();
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

function showStoredInfo(eKey, eValue) {
  // display box
  const entryDisplay = document.createElement("div");
  entryDisplay.setAttribute("class", "section sourceConfig");
  const deleteBtn = createButtonDelete();
  entryDisplay.appendChild(deleteBtn);
  const entryValue = document.createElement("p");
  entryValue.textContent = eValue;
  entryDisplay.appendChild(entryValue);
  const entry = document.createElement("div");
  entry.appendChild(entryDisplay);

  // edit box
  const entryEdit = document.createElement("div");
  entryEdit.setAttribute("class", "section sourceConfig");
  const entryEditInput = document.createElement("input");
  entryEdit.appendChild(entryEditInput);
  const updateBtn = createButtonUpdate();
  entryEdit.appendChild(updateBtn);
  const cancelBtn = ButtonCancel.createInDom();
  entryEdit.appendChild(cancelBtn);
  entry.appendChild(entryEdit);
  entryEditInput.value = eValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  deleteBtn.addEventListener("click", (e) => {
    const evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(
      evtTgt.parentNode.parentNode,
    );
    new BrowserRepository(browser).delete(eKey).catch((error) => {
      reportError(error);
    });
    const urlType = getUrlTypeActive();
    let urls = getUrls();
    // TODO can be this line deleted?
    // Maybe it doesn't do anything because the variable `urls` has
    // the url deleted before showStoredInfo is called.
    urls = deleteUrl(eKey, urls, urlType);
    setUrls(urls);
    const message = Message("urls", urls);
    sendMessage(message);
  });

  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    new ButtonCancel(entryDisplay, entryEdit, entryEditInput, eValue).click();
  });

  updateBtn.addEventListener("click", () => {
    if (entryEditInput.value !== eValue) {
      // type a different value
      let info2save = entryEditInput.value;
      var id2save = eKey.split("_")[0] + "_" + info2save;
      new BrowserRepository(browser).getByKey(id2save).then((result) => {
        // result: empty object if the searched value is not stored
        var searchInStorage = Object.keys(result); // array with the searched value if it is stored
        // searchInStorage.length < 1 -> no stored
        if (searchInStorage.length < 1) {
          const urlType = getUrlTypeActive();
          updateEntry(eKey, id2save, info2save, urlType);
          entry.parentNode.removeChild(entry);
        }
      });
    }
  });

  function createButtonDelete() {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.innerHTML = '<img src="/icons/trash.svg" alt="Delete"/>';
    deleteBtn.setAttribute("title", "Delete");
    return deleteBtn;
  }

  function createButtonUpdate() {
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = '<img src="/icons/ok.svg" alt="Update"/>';
    updateBtn.setAttribute("title", "Update");
    return updateBtn;
  }

  function updateEntry(id2change, id2save, info2save, urlType) {
    const repository = new BrowserRepository(browser);
    let urls = getUrls();
    urls = addUrl(id2save, urls, urlType);
    repository.save(id2save, info2save).then(() => {
      urls = deleteUrl(id2change, urls, urlType);
      repository.delete(id2change).then(() => {
        showStoredInfo(id2save, info2save);
      }, reportError);
    }, reportError);
    const message = Message("urls", urls);
    sendMessage(message);
    setUrls(urls);
  }
}

// TODO sometimes it is called once and an inner function calls it again,
// TODO review the code to reduce the calls to this method.
function getUrlTypeActive() {
  const idTypeMap = [
    { idHtml: "buttonUrlsBlacklist", urlType: URL_TYPE_BLACKLIST },
    { idHtml: "buttonUrlsNotify", urlType: URL_TYPE_NOTIFY },
    { idHtml: "buttonUrlsReferer", urlType: URL_TYPE_REFERER },
  ];
  for (let i = 0; i < idTypeMap.length; i++) {
    const { idHtml, urlType } = idTypeMap[i];
    if (document.getElementById(idHtml).checked) {
      return urlType;
    }
  }
  return null;
}

function showStoredUrlsType(urlType) {
  new BrowserRepository(browser).getAll().then((results) => {
    var keys = Object.keys(results);
    keys.forEach(function (arrayValue) {
      if (arrayValue.includes(urlType)) {
        showStoredInfo(arrayValue, results[arrayValue]);
      }
    });
  }, reportError);
}

function changeParagraph(info2sendFromPopup, response, htmlId) {
  if (response === undefined) {
    document.getElementById(htmlId).textContent =
      "Internal error. The action could not be executed";
  } else {
    // check if the content-script response has been received
    if (info2sendFromPopup === "buttonScroll") {
      document.getElementById(htmlId).textContent = response;
    } else if (info2sendFromPopup === "buttonShowSources") {
      cleanShowSources();
      const frameTagSummary = response["frame"];
      const iframeTagSummary = response["iframe"];
      const htmlStr = getStrTagsHtml(frameTagSummary, iframeTagSummary);
      sourcesContainer.insertAdjacentHTML("afterbegin", htmlStr);
      setupCopyButtonListeners();
    }
  }
}

// TODO cleanShowSources and removeShownStoredUrls: extract common function
function cleanShowSources() {
  while (sourcesContainer.firstChild) {
    sourcesContainer.removeChild(sourcesContainer.firstChild);
  }
}

function removeShownStoredUrls() {
  while (infoContainer.firstChild) {
    infoContainer.removeChild(infoContainer.firstChild);
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
