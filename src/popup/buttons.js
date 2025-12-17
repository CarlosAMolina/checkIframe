class Button {
  run() {
    throw TypeError("Not implemented: method run");
  }

  static get buttonIdHtml() {
    throw TypeError("Not implemented");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
class OnOffButton extends Button {
  initializePopup() {
    throw TypeError("Not implemented: method initializePopup");
  }

  get _idHtml() {
    throw TypeError("Not implemented");
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

export class ButtonShowLogs extends OnOffButton {
  static get buttonIdHtml() {
    return "buttonShowLogs";
  }

  async run() {
    console.log(`Clicked button ID Html: ${this._idHtml}`);
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

  get _idHtml() {
    return ButtonShowLogs.buttonIdHtml;
  }

  get _idStorage() {
    return "idShowLogs";
  }

  // TODO extract to parent class
  activateLogs(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, {
        info: this._idHtml,
        values: 1,
      })
      .catch(console.error);
  }

  // TODO extract to parent class
  deactivateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: this._idHtml,
      values: 0,
    });
  }
}

export class ButtonHighlightAllAutomatically extends OnOffButton {
  static get buttonIdHtml() {
    return "buttonHighlightAllAutomatically";
  }

  async run() {
    console.log(`Clicked button ID Html: ${this._idHtml}`);
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
    hideHtmlId("buttonClean");
    hideHtmlId("buttonScroll");
  }

  unhideElementsForHighlightAllAutomatically() {
    unhideHtmlId("buttonClean");
    unhideHtmlId("buttonScroll");
  }

  get _idHtml() {
    return ButtonHighlightAllAutomatically.buttonIdHtml;
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

// TODO extract to file (this and other files definition)
function hideHtmlId(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

function unhideHtmlId(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}
