class ButtonClicked {
  run() {
    throw TypeError("Not implemented: method run");
  }

  static get buttonIdHtml() {
    throw TypeError("Not implemented");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
class ButtonOnOff extends ButtonClicked {
  static get _buttonIdStorage() {
    throw TypeError("Not implemented");
  }
}

// https://www.scriptol.com/html5/button-on-off.php
export class ButtonShowLogs extends ButtonOnOff {
  static get buttonIdHtml() {
    return "buttonShowLogs";
  }
  static get _buttonIdStorage() {
    return "idShowLogs";
  }

  async run() {
    console.log(`Clicked button ID Html: ${ButtonShowLogs.buttonIdHtml}`);
    let value2save;
    if (this.isOn) {
      this.setStyle("off");
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
      value2save = 0;
    } else {
      this.setStyle("on");
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
      this.setStyle("on");
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.activateLogs)
        .catch(console.error);
    } else {
      this.setStyle("off");
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then(this.deactivateLogs)
        .catch(console.error);
    }
  }

  get isOn() {
    const element = document.getElementById(ButtonShowLogs.buttonIdHtml);
    console.log(
      `Is button ${ButtonShowLogs.buttonIdHtml} checked? ${element.checked}`,
    );
    const result = element.checked === undefined ? false : element.checked;
    console.log(`Is button ${ButtonShowLogs.buttonIdHtml} on? ${result}`);
    return result;
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

  setStyle(style) {
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
    document.getElementById(ButtonShowLogs.buttonIdHtml).style.background =
      styles[style].background;
    document.getElementById(ButtonShowLogs.buttonIdHtml).style.color =
      styles[style].color;
    document.getElementById(ButtonShowLogs.buttonIdHtml).textContent =
      styles[style].textContent;
    document.getElementById(ButtonShowLogs.buttonIdHtml).checked =
      styles[style].checked;
  }
}
