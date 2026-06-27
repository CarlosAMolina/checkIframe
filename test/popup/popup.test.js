import * as fakeModule from "../fake.js";

describe("Check module import", () => {
  beforeEach(() => {
    fakeModule.initializeDomAndBrowser();
    require("../../src/popup/popup.js");
  });
  it("The DOM has expected values", function () {
    expect(document.getElementById("pInput").textContent).toBe("New values");
  });
});

describe("Enter key handler on inputUrl", () => {
  let storedUrlEntriesModule;
  beforeEach(() => {
    jest.resetModules();
    fakeModule.initializeDomAndBrowser();
    require("../../src/popup/popup.js");
    storedUrlEntriesModule = require("../../src/popup/stored-url-entries.js");
  });
  it("triggers saveUrls when Enter key is pressed", async function () {
    const textarea = document.getElementById("inputUrl");
    textarea.value = "example.com";
    const event = new window.KeyboardEvent("keyup", {
      key: "Enter",
      bubbles: true,
    });
    textarea.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(global.browser.tabs.sendMessage).toHaveBeenCalled();
  });
  it("does not trigger saveUrls when a non-Enter key is pressed", async function () {
    await new Promise((resolve) => setTimeout(resolve, 0));
    global.browser.tabs.sendMessage.mockClear();
    const textarea = document.getElementById("inputUrl");
    textarea.value = "example.com";
    const event = new window.KeyboardEvent("keyup", {
      key: "a",
      bubbles: true,
    });
    textarea.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
  it("Enter key uses urlType selected at press time, not at popup open time", async function () {
    // At popup load time no radio button is checked (getUrlTypeActive returns null).
    // The user then selects "notify" — the handler must read the current selection.
    const saveUrlsSpy = jest
      .spyOn(storedUrlEntriesModule, "saveUrls")
      .mockResolvedValue(undefined);
    document.getElementById("buttonUrlsNotify").checked = true;
    const textarea = document.getElementById("inputUrl");
    textarea.value = "example.com";
    textarea.dispatchEvent(
      new window.KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(saveUrlsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "notify",
    );
    document.getElementById("buttonUrlsNotify").checked = false;
    saveUrlsSpy.mockRestore();
  });
});

describe("reportExecuteScriptError", () => {
  let popupModule;
  beforeEach(() => {
    jest.resetModules();
    fakeModule.initializeDomAndBrowser();
    console.error = jest.fn();
    popupModule = require("../../src/popup/popup.js");
  });
  it("logs error message and calls updateElementsWhenIncompatibleWebPage", () => {
    const error = new Error("test error");
    popupModule._forTesting.reportExecuteScriptError(error);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("test error"),
    );
    const errorContent = document.getElementById("error-content");
    expect(errorContent.classList.contains("hidden")).toBe(false);
  });
});

describe("recheckIfAutomaticDetectionIsOff", () => {
  let popupModule;
  beforeEach(() => {
    jest.resetModules();
    fakeModule.runFakeDom("src/popup/popup.html");
    console.log = jest.fn();
  });
  it("sends buttonRecheck when automatic detection is disabled", async () => {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { idAutomaticDetection: false },
    });
    popupModule = require("../../src/popup/popup.js");
    await popupModule._forTesting.recheckIfAutomaticDetectionIsOff();
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      info: "buttonRecheck",
    });
  });
  it("does not send buttonRecheck when automatic detection is enabled", async () => {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { idAutomaticDetection: true },
    });
    popupModule = require("../../src/popup/popup.js");
    global.browser.tabs.sendMessage.mockClear();
    await popupModule._forTesting.recheckIfAutomaticDetectionIsOff();
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ info: "buttonRecheck" }),
    );
  });
  it("does not send buttonRecheck when no stored value exists (automatic detection button defaults to on)", async () => {
    global.browser = fakeModule.fakeBrowser({ storageItems: {} });
    popupModule = require("../../src/popup/popup.js");
    global.browser.tabs.sendMessage.mockClear();
    await popupModule._forTesting.recheckIfAutomaticDetectionIsOff();
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ info: "buttonRecheck" }),
    );
  });
});
