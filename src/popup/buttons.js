import { getUrlTypeActive } from "./url.js";
import { getUrlsInInputBox } from "./ui.js";
import { hide } from "./dom.js";
import { HTML_ID_ERROR_CONTENT } from "./dom.js";
import { HTML_ID_INFO_SCROLL } from "./dom.js";
import { HTML_ID_INFO_TAGS } from "./dom.js";
import { HTML_ID_MENU_CONFIG } from "./dom.js";
import { infoContainer } from "./ui.js";
import { isHidden } from "./dom.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { removeChildren } from "./dom.js";
import { saveUrls } from "./stored-url-entries.js";
import { sendMessage } from "./message-mediator.js";
import { setInfoScrollError } from "./ui.js";
import { setShowSourcesError } from "./ui.js";
import { showSources } from "./ui.js";
import { showStoredUrlsType } from "./stored-url-entries.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";

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
    const mustShowSources = !isHidden(HTML_ID_INFO_TAGS);
    if (mustShowSources) {
      // Hide and unhide (later) to make the visual effect that a recheck has been done.
      hide(HTML_ID_INFO_TAGS);
    }
    return (
      sendMessage(new Message(this._idHtml))
        // Manage content-script response.
        .then((response) => {
          if (mustShowSources) {
            unhide(HTML_ID_INFO_TAGS);
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
    const htmlIdToChange = HTML_ID_INFO_SCROLL;
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
    toggleHide(HTML_ID_MENU_CONFIG);
  }
}

class ButtonShowSources extends Button {
  get _idHtml() {
    return BUTTON_ID_SHOW_SOURCES;
  }

  click() {
    this._logButtonName();
    toggleHide(HTML_ID_INFO_TAGS);
    if (!isHidden(HTML_ID_INFO_TAGS)) {
      return this.showSources();
    }
  }

  showSources() {
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
class ButtonOnOff extends Button {
  get _idStorage() {
    throw new TypeError("Not implemented");
  }

  async initializePopup() {
    const mustBeOn = await this._getIsStoredOn();
    if (mustBeOn) {
      this._setStyleOn();
      await this._onTurnOn();
    } else {
      this._setStyleOff();
      await this._onInitializeOff();
    }
  }

  async click() {
    this._logButtonName();
    if (this._isOn) {
      this._setStyleOff();
      await this._onTurnOff();
    } else {
      this._setStyleOn();
      await this._onTurnOn();
    }
    await this._persistState();
  }

  get _isOn() {
    const element = document.getElementById(this._idHtml);
    console.log(`Is button ${this._idHtml} checked? ${element.checked}`);
    const result = element.checked === undefined ? false : element.checked;
    console.log(`Is button ${this._idHtml} on? ${result}`);
    return result;
  }

  async _getIsStoredOn() {
    return getIsStoredOn(this._idStorage);
  }

  _setStyleOn() {
    this._setStyle("on");
  }

  _setStyleOff() {
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
    const element = document.getElementById(this._idHtml);
    element.style.background = styles[style].background;
    element.style.color = styles[style].color;
    element.textContent = styles[style].textContent;
    element.checked = styles[style].checked;
  }

  async _onTurnOn() {
    throw new TypeError("Not implemented");
  }

  async _onTurnOff() {
    throw new TypeError("Not implemented");
  }

  async _onInitializeOff() {
    return this._onTurnOff();
  }

  async _persistState() {
    await browser.storage.local
      .set({ [this._idStorage]: this._isOn })
      .then(() => {
        console.log(
          `The following value has been stored for ${this._idStorage}: ${this._isOn}`,
        );
      }, console.error);
  }
}

class ButtonAlwaysShowSources extends ButtonOnOff {
  constructor() {
    super();
    this._button = new ButtonShowSources();
  }

  get _idHtml() {
    return BUTTON_ID_ALWAYS_SHOW_SOURCES;
  }

  async _onTurnOn() {
    if (this._canThePageBeAnalyzed()) {
      hide(BUTTON_ID_SHOW_SOURCES);
      await this._showSources();
    }
  }

  async _onTurnOff() {
    if (this._canThePageBeAnalyzed()) {
      unhide(BUTTON_ID_SHOW_SOURCES);
    }
  }

  async _onInitializeOff() {}

  get _idStorage() {
    return "idTagsInfoAlwaysVisible";
  }

  _canThePageBeAnalyzed() {
    return isHidden(HTML_ID_ERROR_CONTENT);
  }

  async _showSources() {
    await this._button.showSources();
    unhide(HTML_ID_INFO_TAGS);
  }
}

class ButtonClean extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAN;
  }

  click() {
    this._logButtonName();
    hide(HTML_ID_INFO_SCROLL);
    sendMessage(new Message(this._idHtml));
  }
}

class ButtonShowLogs extends ButtonOnOff {
  get _idHtml() {
    return BUTTON_ID_SHOW_LOGS;
  }

  async _onTurnOn() {
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this._activateLogs.bind(this))
      .catch(console.error);
  }

  async _onTurnOff() {
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this._deactivateLogs.bind(this))
      .catch(console.error);
  }

  get _idStorage() {
    return "idShowLogs";
  }

  _activateLogs(tabs) {
    // TODO use message mediator, search all code to replace
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: true,
      })
      .catch(console.error);
  }

  _deactivateLogs(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: false,
      })
      .catch(console.error);
  }
}

class ButtonHighlightAllAutomatically extends ButtonOnOff {
  get _idHtml() {
    return BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY;
  }

  async _onTurnOn() {
    this._hideElementsForHighlightAllAutomatically();
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this._activateHighlightAllAutomatically.bind(this))
      .catch(console.error);
  }

  async _onTurnOff() {
    this._unhideElementsForHighlightAllAutomatically();
    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then(this._deactivateHighlightAllAutomatically.bind(this))
      .catch(console.error);
  }

  _hideElementsForHighlightAllAutomatically() {
    hide(BUTTON_ID_CLEAN);
    hide(BUTTON_ID_SCROLL);
  }

  _unhideElementsForHighlightAllAutomatically() {
    unhide(BUTTON_ID_CLEAN);
    unhide(BUTTON_ID_SCROLL);
  }

  get _idStorage() {
    return "idHighlightAllAutomatically";
  }

  _activateHighlightAllAutomatically(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: true,
      })
      .catch(console.error);
  }

  _deactivateHighlightAllAutomatically(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: false,
      })
      .catch(console.error);
  }
}

async function getIsStoredOn(keyName) {
  let resultGetStorage = {};
  try {
    resultGetStorage = await browser.storage.local.get(keyName);
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

class ButtonUrlType extends Button {
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
    removeChildren(this._infoContainer);
    showStoredUrlsType(this._urlType);
  }
}

class ButtonUrlsNotify extends ButtonUrlType {
  get _idHtml() {
    return BUTTON_ID_URLS_NOTIFY;
  }

  get _urlType() {
    return URL_TYPE_NOTIFY;
  }
}

class ButtonUrlsBlacklist extends ButtonUrlType {
  get _idHtml() {
    return BUTTON_ID_URLS_BLACKLIST;
  }

  get _urlType() {
    return URL_TYPE_BLACKLIST;
  }
}

class ButtonUrlsReferer extends ButtonUrlType {
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

  async click() {
    this._logButtonName();
    const urlType = getUrlTypeActive();
    try {
      await this._clearStorageInfo(urlType);
    } catch (e) {
      reportError(e);
    }
  }

  async _clearStorageInfo(urlType) {
    const result = await browser.storage.local.get({ [urlType]: [] });
    const count = result[urlType].length;
    for (let i = 0; i < count; i++) {
      this._infoContainer.removeChild(this._infoContainer.firstChild);
    }
    await browser.storage.local.set({ [urlType]: [] });
    const allArrays = await browser.storage.local.get({
      blacklist: [],
      notify: [],
      referer: [],
    });
    sendMessage(new Message("urls", allArrays));
    return allArrays;
  }
}
