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

function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}
