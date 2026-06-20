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
    const result = checkAndBorderModule._forTesting.HIGHLIGHT_CLASS;
    expect(result).toEqual("check-iframe-detector-highlight");
  });
  it("initializeState runs without error", function () {
    const function_ = checkAndBorderModule._forTesting.initializeState;
    function_();
  });
  it("getPageElements runs without error", function () {
    const function_ = checkAndBorderModule._forTesting.getPageElements;
    function_();
  });
  it("logDetections runs without error", function () {
    const function_ = checkAndBorderModule._forTesting.logDetections;
    function_();
  });
  it("handleButtonRecheck returns sourcesSummary directly", async () => {
    const handleButtonRecheck =
      checkAndBorderModule._forTesting.handleButtonRecheck;
    const result = await handleButtonRecheck();
    expect(result).toHaveProperty("iframe");
    expect(result).toHaveProperty("frame");
  });
});

describe("Test isBlacklistedSource", () => {
  it("isBlacklistedSource uses exact matching, not substring matching", () => {
    const isBlacklistedSource =
      checkAndBorderModule._forTesting.isBlacklistedSource;
    const state = checkAndBorderModule._forTesting.state;
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

describe("Test handleProtocolOk refreshes state from storage", () => {
  it("handleProtocolOk should refresh notifySources from storage before analyzing", async () => {
    // Scenario: User has Tab A and Tab B open, both with iframes from youtube.com.
    // User updates config in popup (Tab A) to add youtube.com as a notify source.
    // The popup only sends the "urls" message to Tab A's content script.
    // When user switches to Tab B, handleActivatedTab triggers handleProtocolOk().
    // Tab B's content script must refresh notifySources from storage (where the update was saved)
    // before analyzing the page, so the icon correctly shows "notify" state.
    const storageItems = {
      notify: ["youtube.com"],
      blacklist: [],
      idHighlightAllAutomatically: false,
    };
    global.browser = fakeModule.fakeBrowser({ storageItems });
    fakeModule.runNoHtmlFakeDom();
    const jsPathName = "../../src/content_scripts/check-and-border.js";
    const testModule = require(jsPathName);
    const handleProtocolOk = testModule._forTesting.handleProtocolOk;
    const state = testModule._forTesting.state;
    state.notifySources = [];
    let sentMessage = null;
    global.browser.runtime.sendMessage = jest.fn((message) => {
      sentMessage = message;
      return Promise.resolve({});
    });
    await handleProtocolOk();
    expect(state.notifySources).toEqual(["youtube.com"]);
    expect(sentMessage).not.toBeNull();
    expect(sentMessage.detectionState).toBe("none");
  });
});
