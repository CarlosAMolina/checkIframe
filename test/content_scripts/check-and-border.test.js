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
  it("createDetectedElement runs without error", function () {
    const function_ = checkAndBorderModule.__get__("createDetectedElement");
    const element = function_("foo", "bar");
    expect(element.tag).toEqual("foo");
  });
  it("initializeContentScript runs without error", function () {
    const function_ = checkAndBorderModule.__get__("initializeContentScript");
    function_();
  });
  it("detectElements runs without error", function () {
    const function_ = checkAndBorderModule.__get__("detectElements");
    function_();
  });
  it("logDetectedTags runs without error", function () {
    const function_ = checkAndBorderModule.__get__("logDetectedTags");
    function_();
  });
});
