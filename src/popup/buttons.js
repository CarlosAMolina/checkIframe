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

  static get _buttonIdStorage() {
    throw TypeError("Not implemented");
  }
}

export class ButtonShowLogs extends OnOffButton {
  static get buttonIdHtml() {
    return "buttonShowLogs";
  }
  static get _buttonIdStorage() {
    return "idShowLogs";
  }

  async run() {
    console.log(`Clicked button ID Html: ${ButtonShowLogs.buttonIdHtml}`);
    if (this.isOn) {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
    } else {
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs)
        .catch(console.error);
    }
    await browser.storage.local
      .set({ [ButtonShowLogs._buttonIdStorage]: this.isOn })
      .then(() => {
        console.log(
          `The following value has been stored for ${ButtonShowLogs._buttonIdStorage}: ${this.isOn}`,
        );
      }, console.error);
  }

  async initializePopup() {
    const mustBeOn = await this.getIsStoredOn();
    if (mustBeOn) {
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs)
        .catch(console.error);
    } else {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
    }
  }

  setStyleOn() {
    setStyle(ButtonShowLogs.buttonIdHtml, "on");
  }

  setStyleOff() {
    setStyle(ButtonShowLogs.buttonIdHtml, "off");
  }

  get isOn() {
    return isOn(ButtonShowLogs.buttonIdHtml);
  }

  activateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonShowLogs.buttonIdHtml,
      values: 1,
    });
  }

  deactivateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonShowLogs.buttonIdHtml,
      values: 0,
    });
  }

  async getIsStoredOn() {
    return getIsStoredOn(ButtonShowLogs._buttonIdStorage);
  }
}

export class ButtonHighlightAllAutomatically extends OnOffButton {
  static get buttonIdHtml() {
    return "buttonHighlightAllAutomatically";
  }
  static get _buttonIdStorage() {
    return "idHighlightAllAutomatically";
  }

  async run() {
    console.log(
      `Clicked button ID Html: ${ButtonHighlightAllAutomatically.buttonIdHtml}`,
    );
    if (this.isOn) {
      this.setStyleOff();
      this.unhideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateHighlightAllAutomatically)
        .catch(console.error);
    } else {
      this.setStyleOn();
      this.hideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateHighlightAllAutomatically)
        .catch(console.error);
    }
    await browser.storage.local
      .set({ [ButtonHighlightAllAutomatically._buttonIdStorage]: this.isOn })
      .then(() => {
        console.log(
          `The following value has been stored for ${ButtonHighlightAllAutomatically._buttonIdStorage}: ${this.isOn}`,
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
        .then(this.activateHighlightAllAutomatically)
        .catch(console.error);
    } else {
      this.setStyleOff();
      this.unhideElementsForHighlightAllAutomatically();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateHighlightAllAutomatically)
        .catch(console.error);
    }
  }

  setStyleOn() {
    setStyle(ButtonHighlightAllAutomatically.buttonIdHtml, "on");
  }

  setStyleOff() {
    setStyle(ButtonHighlightAllAutomatically.buttonIdHtml, "off");
  }

  hideElementsForHighlightAllAutomatically() {
    hideHtmlId("buttonClean");
    hideHtmlId("buttonScroll");
  }

  unhideElementsForHighlightAllAutomatically() {
    unhideHtmlId("buttonClean");
    unhideHtmlId("buttonScroll");
  }

  get isOn() {
    return isOn(ButtonHighlightAllAutomatically.buttonIdHtml);
  }

  activateHighlightAllAutomatically(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonHighlightAllAutomatically.buttonIdHtml,
      values: 1,
    });
  }

  deactivateHighlightAllAutomatically(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonHighlightAllAutomatically.buttonIdHtml,
      values: 0,
    });
  }

  async getIsStoredOn() {
    return getIsStoredOn(ButtonHighlightAllAutomatically._buttonIdStorage);
  }
}

async function getIsStoredOn(buttonIdStorage) {
  let resultGetStorage = {};
  try {
    resultGetStorage = await browser.storage.local.get(buttonIdStorage);
  } catch (e) {
    console.error(e);
  }
  // The result is an empty object if the searched value is not stored.
  const storedButtonIdStorage = resultGetStorage[buttonIdStorage];
  console.log(
    `The stored value for ${buttonIdStorage} is ${storedButtonIdStorage}`,
  );
  // storedButtonIdStorage === undefined -> not previous value was stored
  const result =
    storedButtonIdStorage === undefined ? false : storedButtonIdStorage;
  console.log("Is stored on?", result);
  return result;
}

function isOn(buttonIdHtml) {
  const element = document.getElementById(buttonIdHtml);
  console.log(`Is button ${buttonIdHtml} checked? ${element.checked}`);
  const result = element.checked === undefined ? false : element.checked;
  console.log(`Is button ${buttonIdHtml} on? ${result}`);
  return result;
}

function setStyle(buttonIdHtml, style) {
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
  document.getElementById(buttonIdHtml).style.background =
    styles[style].background;
  document.getElementById(buttonIdHtml).style.color = styles[style].color;
  document.getElementById(buttonIdHtml).textContent = styles[style].textContent;
  document.getElementById(buttonIdHtml).checked = styles[style].checked;
}

// TODO extract to file (this and other files definition)
function hideHtmlId(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

function unhideHtmlId(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}
