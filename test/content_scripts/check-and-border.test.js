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

describe("getDetectionState", () => {
  let testModule;
  let state;
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    testModule = require("../../src/content_scripts/check-and-border.js");
    state = testModule._forTesting.state;
    state.notifySources = [];
    state.blacklistedSources = [];
  });
  it("returns 'none' when no elements exist", () => {
    const result = testModule._forTesting.getDetectionState([]);
    expect(result).toBe("none");
  });
  it("returns 'found' when elements exist but no notify match", () => {
    const elements = [{ tag: "iframe", node: {}, source: "https://foo.com" }];
    const result = testModule._forTesting.getDetectionState(elements);
    expect(result).toBe("found");
  });
  it("returns 'specialFound' when a notify source matches", () => {
    state.notifySources = ["youtube.com"];
    const elements = [
      { tag: "iframe", node: {}, source: "https://youtube.com/embed/abc" },
    ];
    const result = testModule._forTesting.getDetectionState(elements);
    expect(result).toBe("specialFound");
  });
});

describe("handleButtonScroll", () => {
  let testModule;
  let state;
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
    const dom = new (require("jsdom").JSDOM)(
      '<html><body><iframe src="https://a.com/page"></iframe><iframe src="https://b.com/page"></iframe></body></html>',
      { url: "https://test.com" },
    );
    global.document = dom.window.document;
    global.window = dom.window;
    dom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
    testModule = require("../../src/content_scripts/check-and-border.js");
    state = testModule._forTesting.state;
    state.blacklistedSources = [];
    state.notifySources = [];
    state.indexToHighlight = 0;
    global.browser.runtime.sendMessage = jest.fn(() => Promise.resolve({}));
  });
  it("cycles through elements and wraps around", async () => {
    const result1 = await testModule._forTesting.handleButtonScroll();
    expect(result1.text).toContain("1/2");
    const result2 = await testModule._forTesting.handleButtonScroll();
    expect(result2.text).toContain("2/2");
    const result3 = await testModule._forTesting.handleButtonScroll();
    expect(result3.text).toContain("1/2");
  });
  it("returns 'No detections to show' when all elements are blacklisted", async () => {
    state.blacklistedSources = ["https://a.com/page", "https://b.com/page"];
    const result = await testModule._forTesting.handleButtonScroll();
    expect(result).toEqual({ text: "No detections to show", url: null });
  });
});

describe("handleButtonClean", () => {
  let testModule;
  let state;
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
    const dom = new (require("jsdom").JSDOM)(
      '<html><body><iframe src="https://a.com/page" class="check-iframe-detector-highlight"></iframe></body></html>',
      { url: "https://test.com" },
    );
    global.document = dom.window.document;
    global.window = dom.window;
    dom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
    testModule = require("../../src/content_scripts/check-and-border.js");
    state = testModule._forTesting.state;
    state.blacklistedSources = [];
    state.notifySources = [];
    state.indexToHighlight = 5;
    global.browser.runtime.sendMessage = jest.fn(() => Promise.resolve({}));
  });
  it("removes highlight class from all elements and resets index", () => {
    testModule._forTesting.handleButtonClean();
    const iframe = document.querySelector("iframe");
    expect(iframe.classList.contains("check-iframe-detector-highlight")).toBe(
      false,
    );
    expect(state.indexToHighlight).toBe(0);
  });
});

describe("handleButtonHighlightAllAutomatically", () => {
  let testModule;
  let state;
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
    const dom = new (require("jsdom").JSDOM)(
      '<html><body><iframe src="https://a.com/page"></iframe><iframe src="https://b.com/page"></iframe></body></html>',
      { url: "https://test.com" },
    );
    global.document = dom.window.document;
    global.window = dom.window;
    dom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
    testModule = require("../../src/content_scripts/check-and-border.js");
    state = testModule._forTesting.state;
    state.blacklistedSources = [];
    state.notifySources = [];
    global.browser.runtime.sendMessage = jest.fn(() => Promise.resolve({}));
  });
  it("highlights all non-blacklisted elements when turned on", () => {
    testModule._forTesting.handleButtonHighlightAllAutomatically({
      values: true,
    });
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      expect(iframe.classList.contains("check-iframe-detector-highlight")).toBe(
        true,
      );
    });
  });
  it("removes all highlights when turned off", () => {
    testModule._forTesting.handleButtonHighlightAllAutomatically({
      values: true,
    });
    testModule._forTesting.handleButtonHighlightAllAutomatically({
      values: false,
    });
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      expect(iframe.classList.contains("check-iframe-detector-highlight")).toBe(
        false,
      );
    });
  });
  it("does not highlight blacklisted elements", () => {
    state.blacklistedSources = ["https://b.com/page"];
    testModule._forTesting.handleButtonHighlightAllAutomatically({
      values: true,
    });
    const iframes = document.querySelectorAll("iframe");
    expect(
      iframes[0].classList.contains("check-iframe-detector-highlight"),
    ).toBe(true);
    expect(
      iframes[1].classList.contains("check-iframe-detector-highlight"),
    ).toBe(false);
  });
});

describe("handleSourcesUpdate", () => {
  let testModule;
  let state;
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    testModule = require("../../src/content_scripts/check-and-border.js");
    state = testModule._forTesting.state;
    state.blacklistedSources = [];
    state.notifySources = [];
    global.browser.runtime.sendMessage = jest.fn(() => Promise.resolve({}));
  });
  it("updates blacklistedSources and notifySources from message", () => {
    testModule._forTesting.handleSourcesUpdate({
      values: {
        blacklist: ["ads.com", "tracker.org"],
        notify: ["important.com"],
        referer: ["site.com"],
      },
    });
    expect(state.blacklistedSources).toEqual(["ads.com", "tracker.org"]);
    expect(state.notifySources).toEqual(["important.com"]);
  });
  it("sends updated detection state to background script", () => {
    testModule._forTesting.handleSourcesUpdate({
      values: { blacklist: [], notify: [], referer: [] },
    });
    expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ detectionState: "none" }),
    );
  });
});
