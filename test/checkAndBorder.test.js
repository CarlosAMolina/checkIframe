import { runNoHtmlMockDom } from "./mockDom.js";

function mockBrowser() {
  return {
    runtime: {
      onMessage: {
        addListener: jest.fn(),
      },
    },
    storage: {
      local: {
        get: getNewPromise,
      },
    },
  };
  function getNewPromise(args) {
    return new Promise(function (resolve, reject) {
      resolve("Start of new Promise");
    });
  }
}

let checkAndBorderModule;

describe("Check module import", () => {
  beforeAll(() => {
    global.browser = mockBrowser();
    runNoHtmlMockDom();
    const jsPathName = "../src/checkAndBorder.js";
    checkAndBorderModule = require(jsPathName);
  });
  it("The module should be imported without errors and has expected values", function () {
    const result = checkAndBorderModule.__get__("urlTypeBlacklist");
    expect(result).toEqual("blacklist");
  });
  it("element runs without error", function () {
    function_ = checkAndBorderModule.__get__("element");
    new function_("foo", "bar");
  });
  it("initializeContentScript runs without error", function () {
    function_ = checkAndBorderModule.__get__("initializeContentScript");
    function_();
  });
  it("getElementsByTags runs without error", function () {
    function_ = checkAndBorderModule.__get__("getElementsByTags");
    function_();
  });
  it("logs runs without error", function () {
    function_ = checkAndBorderModule.__get__("logs");
    function_();
  });
});
