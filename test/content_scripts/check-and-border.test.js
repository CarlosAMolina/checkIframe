import * as fakeModule from "../fake.js";

let checkAndBorderModule;

describe("Check module import", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    const jsPathName = "../../src/content_scripts/check-and-border.js";
    checkAndBorderModule = require(jsPathName);
  });
  it("The module should be imported without errors and has expected values", function () {
    const result = checkAndBorderModule.__get__("HIGHLIGHT_CLASS");
    expect(result).toEqual("check-iframe-detector-highlight");
  });
  it("initializeGlobalVariables runs without error", function () {
    const function_ = checkAndBorderModule.__get__("initializeGlobalVariables");
    function_();
  });
  it("getPageElements runs without error", function () {
    const function_ = checkAndBorderModule.__get__("getPageElements");
    function_();
  });
  it("logDetections runs without error", function () {
    const function_ = checkAndBorderModule.__get__("logDetections");
    function_();
  });
  it("handleButtonRecheck returns sourcesSummary directly", async () => {
    const handleButtonRecheck = checkAndBorderModule.__get__(
      "handleButtonRecheck",
    );
    const result = await handleButtonRecheck();
    expect(result).toHaveProperty("iframe");
    expect(result).toHaveProperty("frame");
  });
});

describe("Test isBlacklistedSource", () => {
  it("isBlacklistedSource uses exact matching, not substring matching", () => {
    const isBlacklistedSource = checkAndBorderModule.__get__(
      "isBlacklistedSource",
    );
    const state = checkAndBorderModule.__get__("state");
    state.blacklistedSources = ["example.com", "ads.example.org"];
    expect(isBlacklistedSource("example.com")).toBe(true);
    expect(isBlacklistedSource("EXAMPLE.COM")).toBe(true);
    expect(isBlacklistedSource("Example.Com")).toBe(true);
    expect(isBlacklistedSource("ads.example.org")).toBe(true);
    expect(isBlacklistedSource("ADS.EXAMPLE.ORG")).toBe(true);
    expect(isBlacklistedSource("notblacklisted.com")).toBe(false);
    expect(isBlacklistedSource("example.com.fake")).toBe(false);
    expect(isBlacklistedSource("prefix.example.com")).toBe(false);
  });
});
