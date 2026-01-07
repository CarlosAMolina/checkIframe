import * as buttonsModule from "../../src/popup/buttons.js";
import * as fakeModule from "../fake.js";

//TODO import { ButtonShowSources } from "../../src/popup/popup";
//TODO import { hide, unhide } from "../../src/popup/dom";
//TODO
//TODO jest.mock("../../src/popup/dom", () => ({
//TODO   hide: jest.fn(),
//TODO   unhide: jest.fn(),
//TODO }));
//TODO
//TODO jest.mock("../../src/popup/popup", () => {
//TODO   const originalModule = jest.requireActual("../../src/popup/popup");
//TODO   return {
//TODO     ...originalModule,
//TODO     ButtonShowSources: jest.fn().mockImplementation(() => ({
//TODO       showSources: jest.fn().mockResolvedValue(),
//TODO     })),
//TODO   };
//TODO });
//TODO
//TODO global.browser = {
//TODO   storage: {
//TODO     local: {
//TODO       get: jest.fn(),
//TODO       set: jest.fn(),
//TODO     },
//TODO   },
//TODO };
//TODO
describe("ButtonAlwaysShowSources", () => {
  let button;
  let buttonElement;
  //TODO   let showSourcesButtonElement;
  //TODO   let infoTagsElement;
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    //TODO     // Clean up mocks before each test
    //TODO     jest.clearAllMocks();
    //TODO     // Set up a fake DOM
    //TODO     document.body.innerHTML = `
    //TODO       <button id="buttonAlwaysShowSources"></button>
    //TODO       <button id="buttonShowSources"></button>
    //TODO       <div id="infoTags"></div>
    //TODO     `;
    //TODO     // Get fake DOM elements
    //TODO     showSourcesButtonElement = document.getElementById("buttonShowSources");
    //TODO     infoTagsElement = document.getElementById("infoTags");
    //TODO     // Create a new instance of the button class for each test
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
