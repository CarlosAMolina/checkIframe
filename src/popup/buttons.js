class ButtonClicked {
  run() {
    throw TypeError("Not implemented: method run");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
export class ButtonShowLogs extends ButtonClicked {
  static get _buttonIdHtml() {
    return "buttonShowLogs";
  }
  static get _buttonIdStorage() {
    return "idShowLogs";
  }

  async run() {
    console.log(`Clicked button ID Html: ${ButtonShowLogs._buttonIdHtml}`);
    let value2save;
    if (this.isOn) {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
      value2save = 0;
    } else {
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs)
        .catch(console.error);
      value2save = 1;
    }
    await browser.storage.local
      .set({ [ButtonShowLogs._buttonIdStorage]: value2save })
      .then(() => {
        console.log(
          `The following value has been stored for ${ButtonShowLogs._buttonIdStorage}: ${value2save}`,
        );
      }, console.error);
  }

  async initializePopup() {
    const mustBeOn = await this.getIsStoredOn();
    if (mustBeOn) {
      this.setStyleOn();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
    } else {
      this.setStyleOff();
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs)
        .catch(console.error);
    }
  }

  get isOn() {
    const element = document.getElementById(ButtonShowLogs._buttonIdHtml);
    console.log(
      `Is button ${ButtonShowLogs._buttonIdHtml} checked? ${element.checked}`,
    );
    const result = element.checked === undefined ? false : element.checked;
    console.log(`Is button ${ButtonShowLogs._buttonIdHtml} on? ${result}`);
    return result;
  }

  activateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonShowLogs._buttonIdHtml,
      values: 1,
    });
  }

  deactivateLogs(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: ButtonShowLogs._buttonIdHtml,
      values: 0,
    });
  }

  async getIsStoredOn() {
    let result = false;
    let resultGetStorage = {};
    try {
      resultGetStorage = await browser.storage.local.get(
        ButtonShowLogs._buttonIdStorage,
      );
    } catch (e) {
      console.error(e);
    }
    // The result is an empty object if the searched value is not stored.
    const storedButtonIdStorage =
      resultGetStorage[ButtonShowLogs._buttonIdStorage];
    console.log(
      `The stored value for ${ButtonShowLogs._buttonIdStorage} is ${storedButtonIdStorage}`,
    );
    if (storedButtonIdStorage === undefined) {
      console.log(
        `Not previous value for ${ButtonShowLogs._buttonIdStorage} was stored`,
      );
    } else {
      result = storedButtonIdStorage ? true : false;
    }
    console.log("Is stored on?", result);
    return result;
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
    document.getElementById(ButtonShowLogs._buttonIdHtml).style.background =
      style;
    document.getElementById(ButtonShowLogs._buttonIdHtml).style.color = color;
    document.getElementById(ButtonShowLogs._buttonIdHtml).textContent = label;
    document.getElementById(ButtonShowLogs._buttonIdHtml).checked = checked;
  }
}
