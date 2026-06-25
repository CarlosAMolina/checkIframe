import * as fakeModule from "../fake.js";

let backgroundModule;

describe("Check module import", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    const jsPathName = "../../src/background_scripts/background.js";
    backgroundModule = require(jsPathName);
    console.error = jest.fn();
    console.log = jest.fn();
    // https://marek-rozmus.medium.com/mocking-settimeout-with-jest-3fd6b8fa6307
    jest.useFakeTimers();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it("updateTab skips when tab is still loading", function () {
    const function_ = backgroundModule._forTesting.updateTab;
    function_({ id: 1, url: "https://example.com", status: "loading" });
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
  it("appearanceKeyFromDetection returns correct keys", function () {
    const function_ = backgroundModule._forTesting.appearanceKeyFromDetection;
    expect(function_("none", true)).toBe("none");
    expect(function_("found", true)).toBe("found");
    expect(function_("specialFound", true)).toBe("specialFound");
    expect(function_("none", false)).toBe("unsupported");
  });
  it("checkRunRedirect detects url to redirect", function () {
    const function_ = backgroundModule._forTesting.checkRunRedirect;
    expect(function_(["FOO.COM"], "https://foo.com")).toBe(true);
  });
  it("checkRunRedirect returns false when url is empty", function () {
    const function_ = backgroundModule._forTesting.checkRunRedirect;
    expect(function_(["example.com"], "")).toBe(false);
  });
  it("checkRunRedirect returns false when url does not match any referer", function () {
    const function_ = backgroundModule._forTesting.checkRunRedirect;
    expect(
      function_(["example.com", "other.org"], "https://unrelated.net"),
    ).toBe(false);
  });
  it("handleUpdatedTabUrl sets unsupported icon for unsupported protocols", function () {
    const function_ = backgroundModule._forTesting.handleUpdatedTabUrl;
    function_(1, { status: "complete" }, { id: 1, url: "chrome://example" });
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "This web page cannot be analyzed",
      tabId: 1,
    });
    expect(global.browser.action.setIcon).toHaveBeenCalledWith({
      path: "icons/i_gray.png",
      tabId: 1,
    });
  });
  it("handleUpdatedTabUrl does nothing for non-complete status", function () {
    const function_ = backgroundModule._forTesting.handleUpdatedTabUrl;
    function_(1, { status: "loading" }, { id: 1, url: "chrome://example" });
    expect(global.browser.action.setTitle).not.toHaveBeenCalled();
    expect(global.browser.action.setIcon).not.toHaveBeenCalled();
  });
});

describe("applyTabAppearance", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("sets green icon and title for 'none' key", function () {
    backgroundModule._forTesting.applyTabAppearance(1, "none");
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "No (i)frames on the web page",
      tabId: 1,
    });
    expect(global.browser.action.setIcon).toHaveBeenCalledWith({
      path: "icons/i_green.png",
      tabId: 1,
    });
  });
  it("sets orange icon and title for 'found' key", function () {
    backgroundModule._forTesting.applyTabAppearance(1, "found");
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "Web page with (i)frames",
      tabId: 1,
    });
    expect(global.browser.action.setIcon).toHaveBeenCalledWith({
      path: "icons/i_orange.png",
      tabId: 1,
    });
  });
  it("sets purple icon and title for 'specialFound' key", function () {
    backgroundModule._forTesting.applyTabAppearance(1, "specialFound");
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "Detected special (i)frames to notify",
      tabId: 1,
    });
    expect(global.browser.action.setIcon).toHaveBeenCalledWith({
      path: "icons/i_purple.png",
      tabId: 1,
    });
  });
  it("sets gray icon and title for 'unsupported' key", function () {
    backgroundModule._forTesting.applyTabAppearance(1, "unsupported");
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "This web page cannot be analyzed",
      tabId: 1,
    });
    expect(global.browser.action.setIcon).toHaveBeenCalledWith({
      path: "icons/i_gray.png",
      tabId: 1,
    });
  });
});

describe("handleActivatedTab", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("sends protocolOk to the content script for supported protocols", async function () {
    global.browser.tabs.get = jest.fn(() =>
      Promise.resolve({
        id: 5,
        url: "https://example.com",
        status: "complete",
      }),
    );
    await backgroundModule._forTesting.handleActivatedTab({ tabId: 5 });
    expect(global.browser.tabs.get).toHaveBeenCalledWith(5);
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(5, {
      info: "protocolOk",
    });
  });
  it("sets unsupported appearance for unsupported protocols", async function () {
    global.browser.tabs.get = jest.fn(() =>
      Promise.resolve({
        id: 5,
        url: "about:debugging",
        status: "complete",
      }),
    );
    await backgroundModule._forTesting.handleActivatedTab({ tabId: 5 });
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "This web page cannot be analyzed",
      tabId: 5,
    });
  });
});

describe("handleUpdatedWindow", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    console.log = jest.fn();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("ignores NO_BROWSER_WINDOW_ID (-1)", function () {
    backgroundModule._forTesting.handleUpdatedWindow(-1);
    expect(global.browser.tabs.query).not.toHaveBeenCalled();
  });
  it("calls updateActiveTab for valid window IDs", function () {
    backgroundModule._forTesting.handleUpdatedWindow(1);
    expect(global.browser.tabs.query).toHaveBeenCalled();
  });
});

describe("updateTab", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    console.log = jest.fn();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("sends protocolOk for supported protocols", function () {
    backgroundModule._forTesting.updateTab({
      id: 3,
      url: "https://example.com",
      status: "complete",
    });
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(3, {
      info: "protocolOk",
    });
  });
  it("sets unsupported appearance for unsupported protocols", function () {
    backgroundModule._forTesting.updateTab({
      id: 3,
      url: "ftp://example.com",
      status: "complete",
    });
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
    expect(global.browser.action.setTitle).toHaveBeenCalledWith({
      title: "This web page cannot be analyzed",
      tabId: 3,
    });
  });
});

describe("handleContentScriptMessage", () => {
  beforeAll(() => {
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runNoHtmlFakeDom();
    console.log = jest.fn();
    console.error = jest.fn();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    global.browser = fakeModule.fakeBrowser();
  });
  it("responds to contentScriptReady with protocolOk for supported protocols", async function () {
    const message = { info: "contentScriptReady" };
    const sender = { tab: { id: 7, url: "https://example.com" } };
    await backgroundModule._forTesting.handleContentScriptMessage(
      message,
      sender,
    );
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(7, {
      info: "protocolOk",
    });
  });
  it("does not respond to contentScriptReady for unsupported protocols", async function () {
    const message = { info: "contentScriptReady" };
    const sender = { tab: { id: 7, url: "about:blank" } };
    await backgroundModule._forTesting.handleContentScriptMessage(
      message,
      sender,
    );
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
  it("triggers redirect when referer matches and locationUrl differs from tabUrl", async function () {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { referer: ["example.com"] },
    });
    const message = {
      detectionState: "found",
      locationUrl: "https://iframe-target.com",
    };
    const sender = { tab: { id: 2, url: "https://example.com/page" } };
    await backgroundModule._forTesting.handleContentScriptMessage(
      message,
      sender,
    );
    expect(global.browser.tabs.update).toHaveBeenCalledWith(2, {
      url: "https://iframe-target.com",
    });
  });
  it("skips redirect when locationUrl equals tabUrl to prevent infinite loops", async function () {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { referer: ["example.com"] },
    });
    const message = {
      detectionState: "found",
      locationUrl: "https://example.com/page",
    };
    const sender = { tab: { id: 2, url: "https://example.com/page" } };
    await backgroundModule._forTesting.handleContentScriptMessage(
      message,
      sender,
    );
    expect(global.browser.tabs.update).not.toHaveBeenCalled();
  });
});
