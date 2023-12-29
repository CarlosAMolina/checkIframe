import { runMockDom } from "./mockDom.js";

function mockBrowser() {
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    storage: {
      local: {
        get: jest.fn(() => Promise.resolve({})),
        set: getNewPromise,
      },
    },
    tabs: {
      executeScript: getNewPromise,
      // https://stackoverflow.com/questions/56285530/how-to-create-jest-mock-function-with-promise
      query: jest.fn(() => Promise.resolve([{ id: 1 }])),
      sendMessage: jest.fn(() => Promise.resolve({ data: "done sendMessage" })),
    },
  };
}

function getNewPromise(args) {
  return new Promise(function (resolve, reject) {
    resolve("Start of new Promise");
  });
}

function getEmptyNewPromise(args) {
  return new Promise(function (resolve, reject) {
    resolve({});
  });
}

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;
let buttonType;
let button;
let function_;
const buttonIdsHtml = [
  "buttonRecheck",
  "buttonClean",
  "buttonScroll",
  "buttonShowSources",
  "buttonShowConfig",
  "buttonShowLogs",
  "buttonUrlsNotify",
  "buttonUrlsBlacklist",
  "buttonUrlsReferer",
  "buttonAddUrl",
  "buttonClearAll",
];
const tabId = 1;

describe("Check module import", () => {
  beforeEach(() => {
    const htmlPathName = "src/popup/popup.html";
    runMockDom(htmlPathName);
    global.browser = mockBrowser();
    const popupJsPathName = "../src/popup/popup.js";
    popupModule = require(popupJsPathName);
  });
  it("The DOM has expected values", function () {
    expect(document.getElementById("pInput").textContent).toBe("New values");
  });
  it("The module should be imported without errors and has expected values", function () {
    expect(popupModule.__get__("urlTypeBlacklist")).toEqual("blacklist");
  });
  it("url has expected attributes", function () {
    function_ = popupModule.__get__("url");
    const type = "notify";
    const values = ["url_1", "url_2"];
    const url = new function_(type, values);
    expect(url.type).toEqual("notify");
    expect(url.values).toEqual(["url_1", "url_2"]);
  });
  it("popupMain runs without error", function () {
    function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    function_ = popupModule.__get__("initializePopup");
    function_();
  });
  it("getIdHtmlOfClickedButtonOrImageFromEventClick runs without error", function () {
    function_ = popupModule.__get__(
      "getIdHtmlOfClickedButtonOrImageFromEventClick",
    );
    const eventClick = { target: { id: 1 } };
    function_(eventClick);
  });
  it("getUrls runs without error", function () {
    const results = {};
    function_ = popupModule.__get__("getUrls");
    function_(results);
  });
  describe("Check buttons", () => {
    beforeAll(() => {
      const htmlPathName = "src/popup/popup.html";
      runMockDom(htmlPathName);
      global.browser = mockBrowser();
      const popupJsPathName = "../src/popup/popup.js";
      popupModule = require(popupJsPathName);
    });
    describe("Check createButton", () => {
      beforeAll(() => {
        function_ = popupModule.__get__("createButton");
      });
      // Parametrized test.
      it.each(buttonIdsHtml)("Check if valid button ID: %p", (buttonIdHtml) => {
        const result = function_(buttonIdHtml)._buttonIdHtml;
        expect(result).toBe(buttonIdHtml);
      });
      it("Check if invalid button ID", function () {
        const buttonIdHtml = "nonexistent";
        const result = function_(buttonIdHtml);
        expect(result).toBe(false);
      });
    });
    describe("Check buttons run without error", () => {
      it.each(buttonIdsHtml)("Check button ID %p ", (buttonIdHtml) => {
        console.log = jest.fn(); // Avoid lot of logs on the screen.
        console.error = jest.fn(); // Avoid lot of logs on the screen.
        const createButton = popupModule.__get__("createButton");
        const button = createButton(buttonIdHtml);
        button.run;
      });
    });
    describe("Check ButtonClicked", () => {
      beforeAll(() => {
        buttonType = popupModule.__get__("ButtonClicked");
        const buttonIdHtml = "idTest";
        button = new buttonType(buttonIdHtml);
      });
      it("Check buttonIdHtml returns expected result", function () {
        const result = button.buttonIdHtml;
        expect(result).toBe("idTest");
      });
      it("Check run throws error", function () {
        try {
          button.run;
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe("Not implemented: method run");
        }
      });
      it("Check logButtonName logs expected message", function () {
        console.log = jest.fn();
        button.logButtonName;
        expect(console.log).toHaveBeenCalledWith(
          "Clicked button ID Html: idTest",
        );
      });
    });
  });
  describe("Check getShowLogs", () => {
    beforeEach(() => {
      // required reset to avoid errors if only one test is run by filtering with: node_modules/.bin/jest -t '...'
      browser.tabs.query = jest.fn(() => Promise.resolve([{ id: tabId }]));
    });
    describe("Check if the show log option has never been used", () => {
      beforeEach(() => {
        browser.storage.local.get = jest.fn(() => Promise.resolve({}));
      });
      it("Check expected values", async () => {
        expect(document.getElementById("buttonShowLogs").checked).toBe(false);
        function_ = popupModule.__get__("getShowLogs");
        await function_();
        expect(document.getElementById("buttonShowLogs").checked).toBe(false);
        // sendInfoAndValue calls browser.tabs.query
        expect(browser.tabs.query.mock.calls.length).toBe(0);
      });
    });
    describe("Check if the show log option has been activated", () => {
      beforeEach(() => {
        browser.storage.local.get = jest.fn(() =>
          Promise.resolve({ idShowLogs: 1 }),
        );
      });
      it("Check expected values", async () => {
        // sendInfoAndValue calls browser.tabs.query
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        expect(document.getElementById("buttonShowLogs").checked).toBe(false);
        function_ = popupModule.__get__("getShowLogs");
        await Promise.all([function_()]);
        expect(document.getElementById("buttonShowLogs").checked).toBe(true);
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        const idShowLogs = 1;
        expect(browser.tabs.sendMessage.mock.lastCall).toEqual([
          tabId,
          { info: "buttonShowLogs", values: idShowLogs },
        ]);
      });
    });
    describe("Check if the show log option has been deactivated", () => {
      beforeEach(() => {
        document.getElementById("buttonShowLogs").checked = true;
        browser.storage.local.get = jest.fn(() =>
          Promise.resolve({ idShowLogs: 0 }),
        );
      });
      it("Check expected values", async () => {
        // sendInfoAndValue calls browser.tabs.query
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        expect(document.getElementById("buttonShowLogs").checked).toBe(true);
        function_ = popupModule.__get__("getShowLogs");
        await Promise.all([function_()]);
        expect(document.getElementById("buttonShowLogs").checked).toBe(false);
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        const idShowLogs = 0;
        expect(browser.tabs.sendMessage.mock.lastCall).toEqual([
          tabId,
          { info: "buttonShowLogs", values: idShowLogs },
        ]);
      });
    });
  });
  it("clearStorageInfo runs without error", function () {
    function_ = popupModule.__get__("clearStorageInfo");
    function_();
  });
  it("deleteAllUrlType runs without error", function () {
    function_ = popupModule.__get__("deleteAllUrlType");
    const results = {};
    function_(results);
  });
  it("enableElementsConfiguration runs without error", function () {
    function_ = popupModule.__get__("enableElementsConfiguration");
    function_();
  });
  it("showStoredInfo runs without error", function () {
    function_ = popupModule.__get__("showStoredInfo");
    function_();
  });
  it("hideInfo adds class", function () {
    function_ = popupModule.__get__("hideInfo");
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("button menuButton");
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe(
      "button menuButton hidden",
    );
  });
  it("showTagsInfo removes class", function () {
    function_ = popupModule.__get__("showTagsInfo");
    const htmlId = "infoScroll";
    expect(document.getElementById(htmlId).className).toBe("hidden");
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe("");
  });
  describe("Check sendInfo", () => {
    beforeEach(() => {
      const url = popupModule.__get__("url");
      // The first time the popup is initialized I think it has these values.
      popupModule.__set__("values2sendFromPopup", [
        new url("blacklist", []),
        new url("notify", []),
        new url("referer", []),
      ]);
    });
    it("sendInfo has expected calls and values", async () => {
      function_ = popupModule.__get__("sendInfo");
      const tabs = [{ id: 1234 }];
      await function_(tabs);
      const url = popupModule.__get__("url");
      expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
        1234,
        {
          info: "urls",
          values: [
            new url("blacklist", []),
            new url("notify", []),
            new url("referer", []),
          ],
        },
      ]);
      expect(browser.tabs.sendMessage.mock.results[0].value).resolves.toEqual({
        data: "done sendMessage",
      });
    });
  });
  it("showOrHideInfo runs without error", function () {
    function_ = popupModule.__get__("showOrHideInfo");
    const htmlId = "infoScroll";
    function_(htmlId);
  });
  it("showStoredUrlsType runs without error", function () {
    function_ = popupModule.__get__("showStoredUrlsType");
    function_();
  });
  it("sendInfoAndValue has expected calls and values", async () => {
    const info2send = "info 2 send";
    const values2send = "value 2 send";
    function_ = popupModule.__get__("sendInfoAndValue");
    await function_(info2send, values2send);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      1,
      {
        info: "info 2 send",
        values: "value 2 send",
      },
    ]);
  });
  it("sendInfoSaveAndShowAnswer runs without error", function () {
    console.error = jest.fn();
    function_ = popupModule.__get__("sendInfoSaveAndShowAnswer");
    const tabs = [{ id: "a" }];
    function_(tabs);
  });
  it("changeParagraph runs without error", function () {
    const sourceTagSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const response = { foo: sourceTagSummary };
    const htmlId = "infoTags";
    popupModule.__set__("info2sendFromPopup", "buttonShowSources");
    function_ = popupModule.__get__("changeParagraph");
    function_(response, htmlId);
    popupModule.__set__("info2sendFromPopup", "");
  });
  it("enableElements runs without error", function () {
    function_ = popupModule.__get__("enableElements");
    const htmlIdsToChange = ["pInput"];
    function_(htmlIdsToChange);
  });
  it("listSourceTagSummary runs without error", function () {
    function_ = popupModule.__get__("listSourceTagSummary");
    const sourceTagSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    function_("foo", sourceTagSummary);
  });
  it("cleanShowSources runs without error", function () {
    const valueToSet = popupModule.__get__("infoContainer");
    // Required to run all code.
    popupModule.__set__("sourcesContainer", valueToSet);
    function_ = popupModule.__get__("cleanShowSources");
    function_();
  });
  it("removeShownStoredUrls runs without error", function () {
    function_ = popupModule.__get__("removeShownStoredUrls");
    function_();
  });
  it("saveShowLogs runs without error", function () {
    function_ = popupModule.__get__("saveShowLogs");
    function_();
  });
  describe("Check modify urls", () => {
    beforeAll(() => {
      popupModule.__set__("urlType", "blacklist");
    });
    afterEach(() => {
      popupModule.__set__("urlType", "");
    });
    it("deleteUrl runs without error", function () {
      function_ = popupModule.__get__("deleteUrl");
      const eKey = "blacklist_foo";
      function_(eKey);
    });
    it("addUrl runs without error", function () {
      function_ = popupModule.__get__("addUrl");
      const eKey = "blacklist_foo";
      function_(eKey);
    });
  });
  it("saveUrl runs without error", function () {
    function_ = popupModule.__get__("saveUrl");
    function_();
  });
  it("storeInfo runs without error", function () {
    popupModule.__set__("info2save", ["value_1"]);
    function_ = popupModule.__get__("storeInfo");
    function_();
  });
  it("reportError logs expected message", function () {
    function_ = popupModule.__get__("reportError");
    console.error = jest.fn();
    function_("foo message");
    expect(console.error).toHaveBeenCalledWith("Error: foo message");
  });
  it("reportExecuteScriptError runs without error", function () {
    function_ = popupModule.__get__("reportExecuteScriptError");
    const error = {};
    function_(error);
  });
});
