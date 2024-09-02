var showLogs = 0; // TODO rm

class ButtonClicked {
  constructor(buttonIdHtml) {
    this._buttonIdHtml = buttonIdHtml;
  }

  get buttonIdHtml() {
    return this._buttonIdHtml;
  }

  run() {
    throw TypeError("Not implemented: method run");
  }

  // TODO? change attribute to function
  get logButtonName() {
    console.log(`Clicked button ID Html: ${this.buttonIdHtml}`);
  }
}

// https://www.scriptol.com/html5/button-on-off.php
class ButtonOnOff extends ButtonClicked {
  static get _buttonIdStorage() {
    throw TypeError("Not implemented");
  }

  static get buttonIdStorage() {
    return this._buttonIdStorage;
  }

  get isOn() {
    const element = document.getElementById(this.buttonIdHtml);
    console.log(`Is button ${this.buttonIdHtml} checked? ${element.checked}`);
    const result = element.checked === undefined ? false : element.checked;
    console.log(`Is button ${this.buttonIdHtml} on? ${result}`);
    return result;
  }

  async getIsStoredOn() {
    let result = 0;
    let resultGetStorage = {};
    try {
      resultGetStorage = await browser.storage.local.get(
        this.constructor.buttonIdStorage,
      );
    } catch (e) {
      console.error(e);
    }
    // The result is an empty object if the searched value is not stored.
    const storedButtonIdStorage =
      resultGetStorage[this.constructor.buttonIdStorage];
    console.log(
      `The stored value for ${this.constructor.buttonIdStorage} is ${storedButtonIdStorage}`,
    );
    if (storedButtonIdStorage === undefined) {
      console.log(
        `Not previous value for ${this.constructor.buttonIdStorage} was stored`,
      );
    } else {
      result = storedButtonIdStorage ? true : false;
    }
    console.log("Is stored on?", result);
    return result;
  }

  async storeChangeOnOff() {
    const value2save = this.isOn ? 0 : 1;
    await browser.storage.local
      .set({ [this.constructor.buttonIdStorage]: value2save })
      .then(() => {
        console.log(
          `The following value has been stored for ${this.constructor.buttonIdStorage}: ${value2save}`,
        );
      }, console.error);
  }

  setStyleOff() {
    console.log("Setting style off");
    this.setStyleColorLabelChecked("gray", "lightgray", "off", false);
  }

  setStyleOn() {
    console.log("Setting style on");
    this.setStyleColorLabelChecked("green", "lightgreen", "on", true);
  }

  setStyleColorLabelChecked(style, color, label, checked) {
    document.getElementById(this.buttonIdHtml).style.background = style;
    document.getElementById(this.buttonIdHtml).style.color = color;
    document.getElementById(this.buttonIdHtml).textContent = label;
    document.getElementById(this.buttonIdHtml).checked = checked;
  }
}

export class ButtonShowLogs extends ButtonOnOff {
  constructor() {
    super("buttonShowLogs");
  }

  static get _buttonIdStorage() {
    return "idShowLogs";
  }

  async run() {
    this.logButtonName;
    buttonIdHtml = this.buttonIdHtml;
    await this.storeChangeOnOff();
    await this.initializePopup();
  }

  async initializePopup() {
    showLogs = (await this.getIsStoredOn()) ? 1 : 0;
    showLogs ? this.setStyleOn() : this.setStyleOff();
    sendInfoAndValue(this.buttonIdHtml, showLogs);
  }
}

function sendInfoAndValue(info2send, value2send) {
  info2sendFromPopup = info2send;
  values2sendFromPopup = value2send;
  console.log("Sending info", info2send, "and value", value2send);
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(sendInfo)
    .catch(reportError);
}
