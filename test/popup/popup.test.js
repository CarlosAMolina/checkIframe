import * as fakeModule from "../fake.js";

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;

describe("Check module import", () => {
  beforeEach(() => {
    initializeDomAndBrowser();
    popupModule = require("../../src/popup/popup.js");
  });
  it("The DOM has expected values", function () {
    expect(document.getElementById("pInput").textContent).toBe("New values");
  });
  it("popupMain runs without error", function () {
    const function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    const function_ = popupModule.__get__("initializePopup");
    function_();
  });
  it("reportError logs expected message", function () {
    const function_ = popupModule.__get__("reportError");
    console.error = jest.fn();
    function_("foo message");
    expect(console.error).toHaveBeenCalledWith("Error: foo message");
  });
  it("reportExecuteScriptError runs without error", function () {
    const function_ = popupModule.__get__("reportExecuteScriptError");
    const error = {};
    function_(error);
  });
});

describe("Enter key handler on inputUrl", () => {
  beforeEach(() => {
    jest.resetModules();
    initializeDomAndBrowser();
    popupModule = require("../../src/popup/popup.js");
  });
  it("triggers saveUrls when Enter key is pressed", async function () {
    const textarea = document.getElementById("inputUrl");
    textarea.value = "example.com";
    const event = new window.KeyboardEvent("keyup", { key: "Enter", bubbles: true });
    textarea.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(global.browser.tabs.sendMessage).toHaveBeenCalled();
  });
  it("does not trigger saveUrls when a non-Enter key is pressed", async function () {
    await new Promise((resolve) => setTimeout(resolve, 0));
    global.browser.tabs.sendMessage.mockClear();
    const textarea = document.getElementById("inputUrl");
    textarea.value = "example.com";
    const event = new window.KeyboardEvent("keyup", { key: "a", bubbles: true });
    textarea.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
});

function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}
