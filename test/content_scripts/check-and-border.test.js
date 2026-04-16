import * as fakeModule from "../fake.js";

let checkAndBorderModule;

describe("Check module import", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    const jsPathName = "../../src/content_scripts/check-and-border.js";
    checkAndBorderModule = require(jsPathName);
  });
  // TODO uncomment the next test when ES6 import is available
  // TODO it("The module should be imported without errors and has expected values", function () {
  // TODO   const result = checkAndBorderModule.__get__("URL_TYPE_BLACKLIST");
  // TODO   expect(result).toEqual("blacklist");
  // TODO });
  it("element runs without error", function () {
    const function_ = checkAndBorderModule.__get__("element");
    new function_("foo", "bar");
  });
  it("initializeContentScript runs without error", function () {
    const function_ = checkAndBorderModule.__get__("initializeContentScript");
    function_();
  });
  it("getElementsByTags runs without error", function () {
    const function_ = checkAndBorderModule.__get__("getElementsByTags");
    function_();
  });
  it("logDetectedIframes runs without error", function () {
    const function_ = checkAndBorderModule.__get__("logDetectedIframes");
    function_();
  });
});
