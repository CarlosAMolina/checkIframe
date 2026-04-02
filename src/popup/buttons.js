import { BrowserRepository } from "./repository.js";
import { Message } from "./model.js";
import { deleteUrl } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrls } from "./url.js";
import { hide } from "./dom.js";
import { isHidden } from "./dom.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setUrls } from "./url.js";
import { toggleHide } from "./dom.js";
import { unhide } from "./dom.js";
import { setInfoScrollError } from "./ui.js";
import { showSources } from "./ui.js";

// TODO when all buttons are in this file, review and remove unrequired `export`.

export const BUTTON_ID_ALWAYS_SHOW_SOURCES = "buttonAlwaysShowSources";
export const BUTTON_ID_CLEAN = "buttonClean";
export const BUTTON_ID_RECHECK = "buttonRecheck";
export const BUTTON_ID_SCROLL = "buttonScroll";
export const BUTTON_ID_SHOW_CONFIG = "buttonShowConfig";

export class Button {
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

export class ButtonRecheck extends Button {
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

export class ButtonScroll extends Button {
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

export class ButtonShowConfig extends Button {
  get _idHtml() {
    return BUTTON_ID_SHOW_CONFIG;
  }

  click() {
    this._logButtonName();
    toggleHide("menuConfig");
  }
}

export class DynamicButton {
  static createDom() {
    throw TypeError("Not implemented");
  }

  click() {
    throw TypeError("Not implemented");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
export class OnOffButton extends Button {
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

export class ButtonCancel extends DynamicButton {
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

export class ButtonClean extends Button {
  get _idHtml() {
    return BUTTON_ID_CLEAN;
  }

  click() {
    this._logButtonName();
    hide("infoScroll");
    sendMessage(Message(this._idHtml));
  }
}

export class ButtonDelete extends DynamicButton {
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

export class ButtonShowLogs extends OnOffButton {
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

export class ButtonHighlightAllAutomatically extends OnOffButton {
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
    resultGetStorage = await new BrowserRepository(browser).getByKey(keyName);
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
