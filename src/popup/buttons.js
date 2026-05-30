import { BrowserRepository } from "./repository.js";
import { getStoredUrls } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrlsInInputBox } from "./ui.js";
import { hide } from "./dom.js";
import { infoContainer } from "./ui.js";
import { isHidden } from "./dom.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { removeShownStoredUrls } from "./stored-url-entries.js";
import { saveUrls } from "./stored-url-entries.js";
import { sendMessage } from "./message-mediator.js";
import { setInfoScrollError } from "./ui.js";
import { setShowSourcesError } from "./ui.js";
import { setUrls } from "./url.js";
import { showSources } from "./ui.js";
import { showStoredUrlsType } from "./stored-url-entries.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";

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

// TODO when all buttons are in this file, review and remove unrequired `export` and update tests.

export function initializePopupButtons() {
  const buttonMap = {
    [BUTTON_ID_ADD_URL]: () => new ButtonAddUrl(),
    [BUTTON_ID_ALWAYS_SHOW_SOURCES]: () => new ButtonAlwaysShowSources(),
    [BUTTON_ID_CLEAN]: () => new ButtonClean(),
    [BUTTON_ID_CLEAR_ALL]: () => new ButtonClearAll(infoContainer),
    [BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY]: () =>
      new ButtonHighlightAllAutomatically(),
    [BUTTON_ID_RECHECK]: () => new ButtonRecheck(),
    [BUTTON_ID_SHOW_CONFIG]: () => new ButtonShowConfig(),
    [BUTTON_ID_SHOW_LOGS]: () => new ButtonShowLogs(),
    [BUTTON_ID_SCROLL]: () => new ButtonScroll(),
    [BUTTON_ID_SHOW_SOURCES]: () => new ButtonShowSources(),
    [BUTTON_ID_URLS_BLACKLIST]: () => new ButtonUrlsBlacklist(infoContainer),
    [BUTTON_ID_URLS_NOTIFY]: () => new ButtonUrlsNotify(infoContainer),
    [BUTTON_ID_URLS_REFERER]: () => new ButtonUrlsReferer(infoContainer),
  };
  Object.entries(buttonMap).forEach(([id, createInstance]) => {
    const el = document.getElementById(id);
    el.addEventListener("click", () => {
      createInstance().click();
    });
  });
  new ButtonShowLogs().initializePopup();
  new ButtonHighlightAllAutomatically().initializePopup();
  new ButtonAlwaysShowSources().initializePopup();
}

class Button {
  click() {
    throw new TypeError("Not implemented");
  }

  _logButtonName() {
    console.log(`Clicked button ID Html: ${this._idHtml}`);
  }

  get _idHtml() {
    throw new TypeError("Not implemented");
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
      sendMessage(new Message(this._idHtml))
        // Manage content-script response.
        .then((response) => {
          if (mustShowSources) {
            unhide("infoTags");
            showSources(response.response);
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
    return sendMessage(new Message(this._idHtml))
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
    const message = new Message(this._idHtml);
    return sendMessage(message)
      .then((response) => {
        // Manage content-script response.
        const tagSummary = response.response;
        showSources(tagSummary);
      })
      .catch(setShowSourcesError);
  }
}

// https://www.scriptol.com/html5/button-on-off.php
class OnOffButton extends Button {
  initializePopup() {
    throw new TypeError("Not implemented: method initializePopup");
  }

  get _idStorage() {
    throw new TypeError("Not implemented");
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

  async click() {
    this._logButtonName();
    if (this.isOn) {
      this.setStyleOff();
      await this._onTurnOff();
    } else {
      this.setStyleOn();
      await this._onTurnOn();
    }
    await this._persistState();
  }

  async _onTurnOn() {
    throw new TypeError("Not implemented");
  }

  async _onTurnOff() {
    throw new TypeError("Not implemented");
  }

  async _persistState() {
    await browser.storage.local
      .set({ [this._idStorage]: this.isOn })
      .then(() => {
        console.log(
          `The following value has been stored for ${this._idStorage}: ${this.isOn}`,
        );
      }, console.error);
  }
}

class ButtonAlwaysShowSources extends OnOffButton {
  constructor() {
    super();
    this._button = new ButtonShowSources();
  }

  get _idHtml() {
    return BUTTON_ID_ALWAYS_SHOW_SOURCES;
  }

  async _onTurnOn() {
    if (this._canThePageBeAnalyzed()) {
      hide("buttonShowSources");
      await this._showSources();
    }
  }

  async _onTurnOff() {
    if (this._canThePageBeAnalyzed()) {
      unhide("buttonShowSources");
    }
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

class ButtonClean extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAN;
  }

  click() {
    this._logButtonName();
    hide("infoScroll");
    sendMessage(new Message(this._idHtml));
  }
}

class ButtonShowLogs extends OnOffButton {
  // TODO use BUTTON_ID_SHOW_LOGS in popup.js
  get _idHtml() {
    return "buttonShowLogs";
  }

  async _onTurnOn() {
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this.activateLogs.bind(this))
      .catch(console.error);
  }

  async _onTurnOff() {
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this.deactivateLogs.bind(this))
      .catch(console.error);
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
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: 0,
      })
      .catch(console.error);
  }
}

class ButtonHighlightAllAutomatically extends OnOffButton {
  // TODO use BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY in popup.js
  get _idHtml() {
    return "buttonHighlightAllAutomatically";
  }

  async _onTurnOn() {
    this.hideElementsForHighlightAllAutomatically();
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this.activateHighlightAllAutomatically.bind(this))
      .catch(console.error);
  }

  async _onTurnOff() {
    this.unhideElementsForHighlightAllAutomatically();
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this.deactivateHighlightAllAutomatically.bind(this))
      .catch(console.error);
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
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: 1,
      })
      .catch(console.error);
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

class UrlsOfTypeButton extends Button {
  constructor(infoContainer) {
    super();
    this._infoContainer = infoContainer;
  }

  get _urlType() {
    throw new TypeError("Not implemented");
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

class ButtonAddUrl extends Button {
  get _idHtml() {
    return BUTTON_ID_ADD_URL;
  }

  async click() {
    this._logButtonName();
    const urls = getUrlsInInputBox();
    const urlType = getUrlTypeActive();
    await saveUrls(infoContainer, urls, urlType);
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
          const message = new Message("urls", storedUrls);
          sendMessage(message);
          return storedUrls;
        }, reportError);
      }, reportError);
    }, reportError);
  }
}
