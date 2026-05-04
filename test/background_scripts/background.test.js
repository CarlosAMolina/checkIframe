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
  it("updateIcon runs without error", function () {
    const function_ = backgroundModule.__get__("updateIcon");
    function_(1);
  });
  it("change2iconOnInList runs without error", function () {
    const function_ = backgroundModule.__get__("change2iconOnInList");
    function_();
  });
  it("change2iconOn runs without error", function () {
    const function_ = backgroundModule.__get__("change2iconOn");
    function_();
  });
  it("change2iconOff runs without error", function () {
    const function_ = backgroundModule.__get__("change2iconOff");
    function_();
  });
  it("changeTitle runs without error", function () {
    const function_ = backgroundModule.__get__("changeTitle");
    function_();
  });
  it("updateAddonTitle runs without error", function () {
    const function_ = backgroundModule.__get__("updateAddonTitle");
    function_();
  });
  it("checkRunRedirect detects url to redirect", function () {
    const function_ = backgroundModule.__get__("checkRunRedirect");
    expect(function_(["FOO.COM"], "https://foo.com")).toBe(true);
  });
  it("redirectTo runs without error", function () {
    const function_ = backgroundModule.__get__("redirectTo");
    function_();
  });
  it("handleUpdatedWindow runs without error", function () {
    const function_ = backgroundModule.__get__("handleUpdatedWindow");
    function_();
  });
  it("handleUpdatedTabUrl runs without error", function () {
    const function_ = backgroundModule.__get__("handleUpdatedTabUrl");
    function_(undefined, jest.fn());
  });
  it("handleActivatedTab runs without error", function () {
    const function_ = backgroundModule.__get__("handleActivatedTab");
    function_(jest.fn());
  });
});
