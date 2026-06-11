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
  afterAll(() => {
    jest.useRealTimers();
  });
  it("The module should be imported without errors and has expected values", function () {
    const result = backgroundModule.__get__("SUPPORTED_PROTOCOLS");
    expect(result).toEqual(["https:", "http:", "file:"]);
  });
  it("updateActiveTab runs without error", function () {
    const function_ = backgroundModule.__get__("updateActiveTab");
    function_();
  });
  it("applyTabAppearance runs without error", function () {
    const function_ = backgroundModule.__get__("applyTabAppearance");
    function_(1, "none");
  });
  it("appearanceKeyFromDetection returns correct keys", function () {
    const function_ = backgroundModule.__get__("appearanceKeyFromDetection");
    expect(function_("none", true)).toBe("none");
    expect(function_("found", true)).toBe("found");
    expect(function_("specialFound", true)).toBe("specialFound");
    expect(function_("none", false)).toBe("unsupported");
  });
  it("checkRunRedirect detects url to redirect", function () {
    const function_ = backgroundModule.__get__("checkRunRedirect");
    expect(function_(["FOO.COM"], "https://foo.com")).toBe(true);
  });
  it("checkRunRedirect returns false when url is empty", function () {
    const function_ = backgroundModule.__get__("checkRunRedirect");
    expect(function_(["example.com"], "")).toBe(false);
  });
  it("redirectTo receives and uses tabId", function () {
    const function_ = backgroundModule.__get__("redirectTo");
    function_(1, "https://example.com");
  });
  it("handleUpdatedWindow runs without error", function () {
    const function_ = backgroundModule.__get__("handleUpdatedWindow");
    function_();
  });
  it("handleUpdatedTabUrl runs without error", function () {
    const function_ = backgroundModule.__get__("handleUpdatedTabUrl");
    function_(1, { status: "complete" }, { id: 1, url: "https://example.com" });
  });
  it("handleActivatedTab runs without error", function () {
    const function_ = backgroundModule.__get__("handleActivatedTab");
    function_({ tabId: 1 });
  });
});
