import { runMockDom } from "./mockDom.js";

function mockBrowser() {
  return {
    storage: mockLocalStorage(),
    tabs: mockTabs(),
  };
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  function mockLocalStorage() {
    function mockGetLocalStorage() {
      return {
        get: getEmptyNewPromise, // Required to run all storeInfo() if-else code.
        set: getNewPromise,
      };
    }
    return {
      local: mockGetLocalStorage(),
    };
  }
  function mockTabs() {
    return {
      executeScript: getNewPromise,
      query: getNewPromise,
      sendMessage: getNewPromise,
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

describe("Check module import", () => {
  beforeAll(() => {
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
  it("url runs without error", function () {
    function_ = popupModule.__get__("url");
    new function_();
  });
  it("popupMain runs without error", function () {
    function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    function_ = popupModule.__get__("initializePopup");
    function_();
  });
  it("getUrls runs without error", function () {
    const results = {};
    function_ = popupModule.__get__("getUrls");
    function_(results);
  });
  describe("Check buttons", () => {
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
  it("getShowLogs runs without error", function () {
    function_ = popupModule.__get__("getShowLogs");
    function_();
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
  it("getIdHtmlOfClickedButtonOrImageFromEventClick runs without error", function () {
    function_ = popupModule.__get__(
      "getIdHtmlOfClickedButtonOrImageFromEventClick",
    );
    const eventClick = { target: { id: 1 } };
    function_(eventClick);
  });
  it("hideInfo runs without error", function () {
    function_ = popupModule.__get__("hideInfo");
    const htmlId = "infoScroll";
    function_(htmlId);
  });
  it("showTagsInfo runs without error", function () {
    function_ = popupModule.__get__("showTagsInfo");
    const htmlId = "infoScroll";
    function_(htmlId);
  });
  it("sendInfo runs without error", function () {
    function_ = popupModule.__get__("sendInfo");
    const tabs = [{ id: "a" }];
    function_(tabs);
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
  it("sendInfoAndValue runs without error", function () {
    function_ = popupModule.__get__("sendInfoAndValue");
    function_();
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
