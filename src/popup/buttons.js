import { addUrl } from "./url.js";
import { BrowserRepository } from "./repository.js";
import { deleteUrl } from "./url.js";
import { getStoredUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrls } from "./url.js";
import { getUrlsInInputBox } from "./ui.js";
import { hide } from "./dom.js";
import { infoContainer } from "./ui.js";
import { isHidden } from "./dom.js";
import { Message } from "./model.js";
import { removeChildren } from "./dom.js";
import { reportError } from "./log.js";
import { saveUrls } from "./storage.js";
import { sendMessage } from "./message-mediator.js";
import { setInfoScrollError } from "./ui.js";
import { setShowSourcesError } from "./ui.js";
import { setUrls } from "./url.js";
import { showSources } from "./ui.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";
import { URL_TYPE_BLACKLIST } from "../popup/url.js";
import { URL_TYPE_NOTIFY } from "../popup/url.js";
import { URL_TYPE_REFERER } from "../popup/url.js";

// TODO move code with export to the top of the file

const BUTTON_ID_ADD_URL = "buttonAddUrl";
export const BUTTON_ID_ALWAYS_SHOW_SOURCES = "buttonAlwaysShowSources";
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

// TODO when all buttons are in this file, review and remove unrequired `export`.
//TODO move createButton and all buttons to button.js and update tests.
//TODO improve, instead of list all clicked elements, add listen only to buttons and
//TODO drop last `return false` line.
export function createButton(buttonIdHtml) {
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
      return new ButtonClearAll(infoContainer);
    default:
      return false;
  }
}

export function initializePopupButtons() {
  new ButtonShowLogs().initializePopup();
  new ButtonHighlightAllAutomatically().initializePopup();
  new ButtonAlwaysShowSources().initializePopup();
}

class Button {
  click() {
    throw TypeError("Not implemented");
  }

  _logButtonName() {
    console.log(`Clicked button ID Html: ${this._idHtml}`);
  }

  get _idHtml() {
    throw TypeError("Not implemented");
  }
}

class ButtonRecheck extends Button {
  get _idHtml() {
    return BUTTON_ID_RECHECK;
  }

  click() {
    this._logButtonName();
    const mustShowSources = !isHidden("infoTags");
    if (mustShowSources) {
      // Hide and unhide (later) to make the visual effect that a recheck has been done.
      hide("infoTags");
    }
    return (
      sendMessage(Message(this._idHtml))
        // Manage content-script response.
        .then((tagSummary) => {
          if (mustShowSources) {
            unhide("infoTags");
            showSources(tagSummary);
          }
        })
        .catch(console.error)
    );
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
    return sendMessage(Message(this._idHtml))
      .then((response) => {
        // Manage content-script response.
        if (response.response === undefined) {
          throw new Error(`Incorrect response: ${JSON.stringify(response)}`);
        }
        document.getElementById(htmlIdToChange).textContent = response.response;
      })
      .catch(setInfoScrollError);
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

class DynamicButton {
  static createDom() {
    throw TypeError("Not implemented");
  }

  click() {
    throw TypeError("Not implemented");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
class OnOffButton extends Button {
  initializePopup() {
    throw TypeError("Not implemented: method initializePopup");
  }

  get _idStorage() {
    throw TypeError("Not implemented");
  }

  setStyleOn() {
    this._setStyle("on");
  }

  setStyleOff() {
    this._setStyle("off");
  }

  _setStyle(style) {
    console.log("Setting style", style);
    const styles = {
      on: {
        background: "green",
        color: "lightgray",
        textContent: "on",
        checked: true,
      },
      off: {
        background: "gray",
        color: "lightgray",
        textContent: "off",
        checked: false,
      },
    };
    document.getElementById(this._idHtml).style.background =
      styles[style].background;
    document.getElementById(this._idHtml).style.color = styles[style].color;
    document.getElementById(this._idHtml).textContent =
      styles[style].textContent;
    document.getElementById(this._idHtml).checked = styles[style].checked;
  }

  // TODO? as private. Review other public methods too
  get isOn() {
    const element = document.getElementById(this._idHtml);
    console.log(`Is button ${this._idHtml} checked? ${element.checked}`);
    const result = element.checked === undefined ? false : element.checked;
    console.log(`Is button ${this._idHtml} on? ${result}`);
    return result;
  }

  async getIsStoredOn() {
    return getIsStoredOn(this._idStorage);
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

class ButtonCancel extends DynamicButton {
  constructor(entryDisplay, entryEdit) {
    super();
    this._entryDisplay = entryDisplay;
    this._entryEdit = entryEdit;
  }

  static createDom() {
    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<img src="/icons/cancel.svg" alt="Cancel update"/>';
    cancelBtn.setAttribute("title", "Cancel update");
    return cancelBtn;
  }

  click() {
    this._entryDisplay.style.display = "";
    this._entryEdit.style.display = "none";
  }
}

class ButtonClean extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAN;
  }

  click() {
    this._logButtonName();
    hide("infoScroll");
    sendMessage(Message(this._idHtml));
  }
}

class ButtonDelete extends DynamicButton {
  constructor(event, storageKey) {
    super();
    this._event = event;
    this._repository = new BrowserRepository(browser);
    this._storageKey = storageKey;
  }

  static createDom() {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.innerHTML = '<img src="/icons/trash.svg" alt="Delete"/>';
    deleteBtn.setAttribute("title", "Delete");
    return deleteBtn;
  }

  click() {
    this._event.target.parentNode.parentNode.parentNode.removeChild(
      this._event.target.parentNode.parentNode,
    );
    this._repository.delete(this._storageKey).catch((error) => {
      reportError(error);
    });
    const urlType = getUrlTypeActive();
    let urls = getUrls();
    // TODO can be this line deleted?
    // Maybe it doesn't do anything because the variable `urls` has
    // the url deleted before showStoredInfo is called.
    urls = deleteUrl(this._storageKey, urls, urlType);
    setUrls(urls);
    sendMessage(Message("urls", urls));
  }
}

class ButtonShowLogs extends OnOffButton {
  // TODO use BUTTON_ID_SHOW_LOGS in popup.js
  get _idHtml() {
    return "buttonShowLogs";
  }

  async click() {
    this._logButtonName();
    if (this.isOn) {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs.bind(this))
        .catch(console.error);
    } else {
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs.bind(this))
        .catch(console.error);
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
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs.bind(this))
        .catch(console.error);
    } else {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs.bind(this))
        .catch(console.error);
    }
  }

  get _idStorage() {
    return "idShowLogs";
  }

  activateLogs(tabs) {
    // TODO use message mediator, search all code to replace
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: 1,
      })
      .catch(console.error);
  }

  deactivateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: this._idHtml,
      values: 0,
    });
  }
}

class ButtonHighlightAllAutomatically extends OnOffButton {
  // TODO use BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY in popup.js
  get _idHtml() {
    return "buttonHighlightAllAutomatically";
  }

  async click() {
    this._logButtonName();
    if (this.isOn) {
      this.setStyleOff();
      this.unhideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateHighlightAllAutomatically.bind(this))
        .catch(console.error);
    } else {
      this.setStyleOn();
      this.hideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateHighlightAllAutomatically.bind(this))
        .catch(console.error);
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
    const mustHighlightAllAutomatically = await this.getIsStoredOn();
    if (mustHighlightAllAutomatically) {
      this.setStyleOn();
      this.hideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateHighlightAllAutomatically.bind(this))
        .catch(console.error);
    } else {
      this.setStyleOff();
      this.unhideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateHighlightAllAutomatically.bind(this))
        .catch(console.error);
    }
  }

  hideElementsForHighlightAllAutomatically() {
    hide("buttonClean");
    hide("buttonScroll");
  }

  unhideElementsForHighlightAllAutomatically() {
    unhide("buttonClean");
    unhide("buttonScroll");
  }

  get _idStorage() {
    return "idHighlightAllAutomatically";
  }

  activateHighlightAllAutomatically(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: this._idHtml,
      values: 1,
    });
  }

  deactivateHighlightAllAutomatically(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: 0,
      })
      .catch(console.error);
  }
}

async function getIsStoredOn(keyName) {
  let resultGetStorage = {};
  try {
    resultGetStorage = await new BrowserRepository(browser).get(keyName);
  } catch (e) {
    console.error(e);
  }
  // The result is an empty object if the searched value is not stored.
  const storedButtonIdStorage = resultGetStorage[keyName];
  console.log(`The stored value for ${keyName} is ${storedButtonIdStorage}`);
  // storedButtonIdStorage === undefined -> not previous value was stored
  const result =
    storedButtonIdStorage === undefined ? false : storedButtonIdStorage;
  console.log("Is stored on?", result);
  return result;
}

function showStoredInfo(infoContainer, storageKey, storageValue) {
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
    this._repository.get(this._key2save).then((result) => {
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
        showStoredInfo(infoContainer, this._key2save, this._info2save);
      }, reportError);
    }, reportError);
    sendMessage(Message("urls", urls));
    setUrls(urls);
  }
}

class UrlsOfTypeButton extends Button {
  constructor(infoContainer) {
    super();
    this._infoContainer = infoContainer;
  }

  get _urlType() {
    throw TypeError("Not implemented");
  }

  click() {
    this._logButtonName();
    unhide(HTML_ID_SOURCES_CONFIG);
    removeShownStoredUrls(this._infoContainer);
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

function showStoredUrlsType(urlType) {
  new BrowserRepository(browser).getAll().then((storageItems) => {
    const keys = Object.keys(storageItems);
    keys.forEach(function (key) {
      if (key.includes(urlType + "_")) {
        showStoredInfo(infoContainer, key, storageItems[key]);
      }
    });
  }, reportError);
}

// TODO deprecate removeShownStoredUrls, use removeChildren only.
function removeShownStoredUrls(infoContainer) {
  removeChildren(infoContainer);
}

class ButtonAddUrl extends Button {
  get _idHtml() {
    return BUTTON_ID_ADD_URL;
  }

  click() {
    this._logButtonName();
    const urls = getUrlsInInputBox();
    const urlType = getUrlTypeActive();
    saveUrls(urls, urlType);
  }
}

class ButtonClearAll extends Button {
  constructor(infoContainer) {
    super();
    this._infoContainer = infoContainer;
  }
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
        this._infoContainer.removeChild(this._infoContainer.firstChild);
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
