import * as buttonsModule from "../../src/popup/buttons.js";
import * as fakeModule from "../fake.js";

describe("ButtonAlwaysShowSources", () => {
  let button;
  let buttonElement;
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    const popupModule = require("../../src/popup/popup.js");
    const ButtonAlwaysShowSources = popupModule.__get__(
      "ButtonAlwaysShowSources",
    );
    button = new ButtonAlwaysShowSources();
    buttonElement = document.getElementById(
      buttonsModule.BUTTON_ID_ALWAYS_SHOW_SOURCES,
    );
  });
  describe("click", () => {
    it("should modify UI as expected and save state when clicked while OFF", async () => {
      // Test configuration.
      buttonElement.checked = false; // Button is OFF initially.
      // Test
      await button.click();
      expect(buttonElement.checked).toBe(true);
      expect(isHidden("buttonShowSources")).toBe(true);
      expect(isHidden("infoTags")).toBe(false);
      const tabId = 1;
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
        info: "buttonShowSources",
      });
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: true,
      });
    });
    it("should modify UI as expected and save state when clicked while ON", async () => {
      // Test configuration.
      buttonElement.checked = true; // Button is ON initially.
      // Test
      await button.click();
      expect(buttonElement.checked).toBe(false);
      expect(isHidden("buttonShowSources")).toBe(false);
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: false,
      });
    });
  });
  describe("initializePopup", () => {
    it("should modify UI as expected when storage is true", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: true },
      });
      // Test.
      await button.initializePopup();
      expect(buttonElement.checked).toBe(true);
      expect(isHidden("buttonShowSources")).toBe(true);
      expect(isHidden("infoTags")).toBe(false);
      const tabId = 1;
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
        info: "buttonShowSources",
      });
    });
    it("should set style to OFF when storage is false", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: false },
      });
      // Test.
      await button.initializePopup();
      expect(buttonElement.checked).toBe(false);
    });
    it("should set style to OFF when not stored configuration", async () => {
      // Configure test.
      browser = fakeModule.fakeBrowser({
        storageItems: {},
      });
      // Test.
      await button.initializePopup();
      expect(buttonElement.checked).toBe(false);
    });
  });
  function isHidden(idHtml) {
    return document.getElementById(idHtml).classList.contains("hidden");
  }
});
