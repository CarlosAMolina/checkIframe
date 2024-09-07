import fs from "fs";
import path from "path";

import { runMockDom } from "./mockDom.js";

function mockBrowser() {
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    storage: {
      local: {
        get: jest.fn(() => Promise.resolve({})),
        remove: jest.fn(() => Promise.resolve({})),
        set: jest.fn(() => Promise.resolve({})),
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
  "buttonUrlsNotify",
  "buttonUrlsBlacklist",
  "buttonUrlsReferer",
  "buttonAddUrl",
  "buttonClearAll",
];
const tabId = 1;

describe("Check module import", () => {
  beforeEach(() => {
    initializeMocks();
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
      initializeMocks();
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
        button.run();
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
          button.run();
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
    describe("Check ButtonRecheck", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonRecheck");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonRecheck");
      });
      it("Check run has expected calls and values", async () => {
        document.querySelector("#infoTags").classList.remove("hidden");
        expect(document.getElementById("infoTags").className).toBe(
          "section sources-container",
        );
        await button.run();
        const buttonIdHtml = "buttonRecheck";
        expect(popupModule.__get__("info2sendFromPopup")).toBe(buttonIdHtml);
        expect(document.getElementById("infoTags").className).toBe(
          "section sources-container hidden",
        );
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall[0]).toBe(tabId);
        expect(lastCall[1].info).toBe(buttonIdHtml);
        // TODO check and control lastCall[1].values (is affected by other tests that create a big array of aleatory size).
      });
    });
    describe("Check ButtonClean", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonClean");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonClean");
      });
      it("Check run has expected calls and values", async () => {
        document.querySelector("#infoScroll").classList.remove("hidden");
        expect(document.getElementById("infoScroll").className).toBe("section");
        await button.run();
        const buttonIdHtml = "buttonClean";
        expect(popupModule.__get__("info2sendFromPopup")).toBe(buttonIdHtml);
        expect(document.getElementById("infoScroll").className).toBe(
          "section hidden",
        );
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall[0]).toBe(tabId);
        expect(lastCall[1].info).toBe(buttonIdHtml);
        // TODO check and control lastCall[1].values (is affected by other tests that create a big array of aleatory size).
      });
    });
    describe("Check ButtonScroll", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonScroll");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonScroll");
      });
      describe("Check button run", () => {
        describe("Check if all required data exists", () => {
          beforeEach(() => {
            popupModule.__set__("htmlIdToChange", undefined);
            browser.tabs.sendMessage = jest.fn(() =>
              Promise.resolve({ response: "done sendMessage" }),
            );
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.run()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "done sendMessage",
            );
          });
        });
        describe("Check if undefined response.response", () => {
          beforeEach(() => {
            popupModule.__set__("htmlIdToChange", undefined);
            browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.run()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "Internal error. The action could not be executed",
            );
          });
        });
        function runBeforeRunExpects() {
          const infoScrollBeforeRun = document.getElementById("infoScroll");
          expect(infoScrollBeforeRun.className).toBe("section hidden");
          expect(infoScrollBeforeRun.textContent).toBe("");
          expect(popupModule.__get__("htmlIdToChange")).toBe(undefined);
        }
        function runAfterRunExpects() {
          expect(popupModule.__get__("info2sendFromPopup")).toBe(
            "buttonScroll",
          );
          expect(document.getElementById("infoScroll").className).toBe(
            "section",
          );
          expect(popupModule.__get__("htmlIdToChange")).toEqual("infoScroll");
          expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
          const lastCall = browser.tabs.sendMessage.mock.lastCall;
          expect(lastCall).toEqual([tabId, { info: "buttonScroll" }]);
        }
      });
    });
    describe("Check ButtonShowSources", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonShowSources");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonShowSources");
      });
      describe("Check button run", () => {
        describe("Check if all required data exists", () => {
          beforeEach(() => {
            popupModule.__set__("htmlIdToChange", undefined);
            browser.tabs.sendMessage = jest.fn(() =>
              Promise.resolve({
                response: {
                  frame: { sourcesAllNumber: 0, sourcesValid: [] },
                  iframe: {
                    sourcesAllNumber: 2,
                    sourcesValid: ["https://test.com", "about:blank"],
                  },
                },
              }),
            );
            mockNotEmptySourcesContainer();
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            expect(
              popupModule.__get__("sourcesContainer").firstChild.textContent,
            ).toBe("foo");
            await Promise.all([button.run()]);
            runAfterRunExpects();
            const result = popupModule.__get__("sourcesContainer").innerHTML;
            const expectedResult = getFileContent("html/tags-multiple-iframe.html", "utf8");
            expect(result).toBe(expectedResult);
          });
        });
        describe("Check if undefined response.response", () => {
          beforeEach(() => {
            popupModule.__set__("htmlIdToChange", undefined);
            browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.run()]);
            runAfterRunExpects();
            expect(document.getElementById("infoTags").textContent).toBe(
              "Internal error. The action could not be executed",
            );
          });
        });
      });
      function runBeforeRunExpects() {
        const infoScrollBeforeRun = document.getElementById("infoTags");
        expect(infoScrollBeforeRun.className).toBe(
          "section sources-container hidden",
        );
        expect(infoScrollBeforeRun.textContent).toBe("");
        expect(popupModule.__get__("htmlIdToChange")).toBe(undefined);
      }
      function runAfterRunExpects() {
        expect(popupModule.__get__("info2sendFromPopup")).toBe(
          "buttonShowSources",
        );
        expect(document.getElementById("infoTags").className).toBe(
          "section sources-container",
        );
        expect(popupModule.__get__("htmlIdToChange")).toEqual("infoTags");
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall).toEqual([tabId, { info: "buttonShowSources" }]);
      }
    });
    describe("Check ButtonShowConfig", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonShowConfig");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonShowConfig");
      });
      it("Check run has expected calls and values", function () {
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGrey hidden",
        );
        button.run();
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGrey",
        );
      });
    });
    describe("Check ButtonUrlsNotify", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonUrlsNotify");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button.buttonIdHtml).toBe("buttonUrlsNotify");
      });
      describe("Check run has expected calls and values", () => {
        describe("Test urltype global variable", () => {
          beforeEach(() => {
            popupModule.__set__("urlType", "");
          });
          it("Test", async () => {
            expect(popupModule.__get__("urlType")).toEqual("");
            button.run();
            expect(popupModule.__get__("urlType")).toEqual("notify");
          });
        });
        describe("Test removeShownStoredUrls call", () => {
          beforeEach(() => {
            mockNotEmptyInfoContainer();
          });
          it("Test", async () => {
            expect(
              popupModule.__get__("infoContainer").firstChild.textContent,
            ).toBe("foo");
            button.run();
            expect(popupModule.__get__("infoContainer").firstChild).toBe(null);
          });
        });
        // TODO describe("Test showStoredUrlsType call", () => {
        // TODO     console.info("*** start"); // TODO rm
        // TODO     console.info("*** end"); // TODO rm
        // TODO });
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
  describe("Check function showStoredInfo", () => {
    describe("DOM elements are created correctly", () => {
      beforeEach(() => {
        mockEmptyInfoContainer();
      });
      it("If no values to manage", function () {
        expect(popupModule.__get__("infoContainer").innerHTML).toBe("");
        function_ = popupModule.__get__("showStoredInfo");
        function_();
        expect(popupModule.__get__("infoContainer").innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p></p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
      it("If values to manage", function () {
        expect(popupModule.__get__("infoContainer").innerHTML).toBe("");
        function_ = popupModule.__get__("showStoredInfo");
        const eKey = "blacklist_https://foo.com/test.html";
        const eValue = "https://foo.com/test.html";
        function_(eKey, eValue);
        expect(popupModule.__get__("infoContainer").innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p>https://foo.com/test.html</p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
    });
    describe("Buttons run correctly", () => {
      beforeEach(() => {
        const url = popupModule.__get__("url");
        popupModule.__set__("urls", [
          new url("blacklist", []),
          new url("notify", []),
          new url("referer", []),
        ]);
        browser.tabs.sendMessage = jest.fn(() =>
          Promise.resolve({ data: "done sendMessage" }),
        );
        mockEmptyInfoContainer();
      });
      it("Test click deleteBtn", async () => {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        // TODO in some part of the code the urls.blacklist must have de eKey or eValue value. Add this behaviour to the tests.
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const buttons = infoContainer.getElementsByTagName("button");
        expect(buttons.length).toBe(3);
        expect(buttons[0].title).toBe("Delete");
        expect(buttons[1].title).toBe("Update");
        expect(buttons[2].title).toBe("Cancel update");
        const deleteButton = buttons[0];
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        const url = popupModule.__get__("url");
        expect(popupModule.__get__("urls")).toEqual([
          new url("blacklist", []),
          new url("notify", []),
          new url("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        await deleteButton.click();
        const buttonsAfterClick = infoContainer.getElementsByTagName("button");
        // Test elements have been deleted.
        expect(buttonsAfterClick.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(1);
        expect(browser.storage.local.remove.mock.lastCall).toEqual([eKey]);
        expect(popupModule.__get__("urls")).toEqual([
          new url("blacklist", []),
          new url("notify", []),
          new url("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new url("blacklist", []),
              new url("notify", []),
              new url("referer", []),
            ],
          },
        ]);
      });
      it("Test click entryValue", function () {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("p").length,
        ).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const pElements = infoContainer.getElementsByTagName("p");
        const entryValue = pElements[0];
        expect(entryValue.textContent).toBe("https://foo.com/test.html");
        const indexDivElementToCheck = 1;
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        entryValue.click();
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe("display: none;");
      });
      it("Test click cancelBtn", function () {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("button")
            .length,
        ).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const cancelButton = infoContainer.getElementsByTagName("button")[2];
        expect(cancelButton.title).toBe("Cancel update");
        const indexDivElementToCheck = 1;
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
        cancelButton.click();
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
      });
      it("Test click updateBtn", async () => {
        // TODO move to beforeEach
        popupModule.__set__("urlType", "blacklist");
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        const url = popupModule.__get__("url");
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", []),
          new url("notify", []),
          new url("referer", []),
        ]);
        popupModule.__set__("urls", [
          new url("blacklist", [eValue]),
          new url("notify", []),
          new url("referer", []),
        ]);
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", ["https://foo.com/test.html"]),
          new url("notify", []),
          new url("referer", []),
        ]);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
        const infoContainer = popupModule.__get__("infoContainer");
        const updateButton = infoContainer.getElementsByTagName("button")[1];
        expect(updateButton.title).toBe("Update");
        const entryEditInputValue = "https://new-url.com/test-2.html";
        popupModule
          .__get__("infoContainer")
          .getElementsByTagName("input")[0].value = entryEditInputValue;
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe(entryEditInputValue);
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", ["https://foo.com/test.html"]),
          new url("notify", []),
          new url("referer", []),
        ]);
        // TODO FIX ASSERT expect(popupModule.__get__("info2save")).toBe(undefined);
        expect(browser.storage.local.get.mock.calls.length).toBe(0);
        expect(browser.storage.local.set.mock.calls.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        await Promise.all([updateButton.click()]);
        expect(popupModule.__get__("info2save")).toBe(entryEditInputValue);
        expect(browser.storage.local.get.mock.calls.length).toBe(1);
        const expectedId2save = "blacklist_https://new-url.com/test-2.html";
        expect(browser.storage.local.get.mock.lastCall).toEqual([
          expectedId2save,
        ]);
        // Test updateEntry
        // Test addUrl
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", ["https://new-url.com/test-2.html"]),
          new url("notify", []),
          new url("referer", []),
        ]);
        expect(browser.storage.local.set.mock.calls.length).toBe(1);
        const expectedInfo2save = "https://new-url.com/test-2.html";
        expect(browser.storage.local.set.mock.lastCall).toStrictEqual([
          { "blacklist_https://new-url.com/test-2.html": expectedInfo2save },
        ]);
        expect(browser.storage.local.remove.mock.calls.length).toBe(1);
        expect(browser.storage.local.remove.mock.lastCall).toStrictEqual([
          "blacklist_https://foo.com/test.html",
        ]);
        // TODO not tested (is executed after the test ends): removingEntry.then(() => { showStoredInfo
        // Test sendInfoAndValue
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new url("blacklist", ["https://new-url.com/test-2.html"]),
              new url("notify", []),
              new url("referer", []),
            ],
          },
        ]);
        // TODO not tested entry.parentNode.removeChild(entry);
      });
    });
  });
  it("hideHtmlId adds class", function () {
    function_ = popupModule.__get__("hideHtmlId");
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
  });
  it("unhideHtmlId removes class", function () {
    function_ = popupModule.__get__("unhideHtmlId");
    const htmlId = "infoScroll";
    expect(document.getElementById(htmlId).className).toBe("section hidden");
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe("section");
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
      tabId,
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
    // Function tested in other buttons' tests.
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
  describe("Check listSourceTagSummary", () => {
    beforeEach(() => {
      popupModule.__set__(
        "sourcesContainer",
        document.querySelector(".sources-container"),
      );
    });
    it("Test if 0 sourcesAllNumber", function () {
      const tag = "iframe";
      const sourceTagSummary = {
        sourcesAllNumber: 0,
        sourcesValid: [],
      };
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
      function_ = popupModule.__get__("listSourceTagSummary");
      function_(tag, sourceTagSummary);
      expect(popupModule.__get__("sourcesContainer").innerHTML).toBe(
        "<p><u>0 elements with tag <b>iframe</b></u><p></p></p>",
      );
    });
    it("Test if sourcesAllNumber and empty sourcesValid array", function () {
      const tag = "iframe";
      const sourceTagSummary = {
        sourcesAllNumber: 1,
        sourcesValid: [],
      };
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
      function_ = popupModule.__get__("listSourceTagSummary");
      function_(tag, sourceTagSummary);
      expect(popupModule.__get__("sourcesContainer").innerHTML).toBe(
        "<p><u>1 element with tag <b>iframe</b></u><p>Without not blacklisted sources.</p></p>",
      );
    });
    it("Test if only one value in sourcesValid array", function () {
      const tag = "iframe";
      const sourceTagSummary = {
        sourcesAllNumber: 1,
        sourcesValid: ["https://test.com"],
      };
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
      function_ = popupModule.__get__("listSourceTagSummary");
      function_(tag, sourceTagSummary);
      expect(popupModule.__get__("sourcesContainer").innerHTML).toBe(
        '<p><u>1 element with tag <b>iframe</b></u><p>Sources (not blacklisted):</p></p><div><p>1 - <a href="https://test.com">https://test.com</a></p></div>',
      );
    });
    it("Test if more than one value in sourcesValid array", function () {
      const tag = "iframe";
      const sourceTagSummary = {
        sourcesAllNumber: 2,
        sourcesValid: ["https://test.com", "about:blank"],
      };
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
      function_ = popupModule.__get__("listSourceTagSummary");
      function_(tag, sourceTagSummary);
      expect(popupModule.__get__("sourcesContainer").innerHTML).toBe(
        '<p><u>2 elements with tag <b>iframe</b></u><p>Sources (not blacklisted):</p></p><div><p>1 - <a href="https://test.com">https://test.com</a></p></div><div><p>2 - <a href="about:blank">about:blank</a></p></div>',
      );
    });
    it("Test if values and blacklisted sources", function () {
      const tag = "iframe";
      const sourceTagSummary = {
        sourcesAllNumber: 4,
        sourcesValid: ["https://test.com", "about:blank"],
      };
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
      function_ = popupModule.__get__("listSourceTagSummary");
      function_(tag, sourceTagSummary);
      expect(popupModule.__get__("sourcesContainer").innerHTML).toBe(
        '<p><u>4 elements with tag <b>iframe</b></u><p>Sources (not blacklisted):</p></p><div><p>1 - <a href="https://test.com">https://test.com</a></p></div><div><p>2 - <a href="about:blank">about:blank</a></p></div>',
      );
    });
  });
  describe("Check cleanShowSources", () => {
    beforeEach(() => {
      mockNotEmptySourcesContainer();
    });
    it("Elements are modified", function () {
      expect(
        popupModule.__get__("sourcesContainer").firstChild.textContent,
      ).toBe("foo");
      function_ = popupModule.__get__("cleanShowSources");
      function_();
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
    });
  });
  describe("Check removeShownStoredUrls", () => {
    beforeEach(() => {
      mockNotEmptyInfoContainer();
    });
    it("Elements are modified", function () {
      expect(popupModule.__get__("infoContainer").firstChild.textContent).toBe(
        "foo",
      );
      function_ = popupModule.__get__("removeShownStoredUrls");
      function_();
      expect(popupModule.__get__("infoContainer").firstChild).toBe(null);
    });
  });
  describe("Check modify urls", () => {
    beforeAll(() => {
      popupModule.__set__("urlType", "blacklist");
    });
    afterEach(() => {
      popupModule.__set__("urlType", "");
    });
    describe("deleteUrl runs without error", () => {
      beforeAll(() => {
        const url = popupModule.__get__("url");
        popupModule.__set__("urls", [
          new url("blacklist", [
            "https://foo.com/foo.html",
            "https://foo.com/foo-2.html",
          ]),
          new url("notify", [
            "https://foo.com/foo-3.html",
            "https://foo.com/foo-4.html",
          ]),
          new url("referer", [
            "https://foo.com/foo-5.html",
            "https://foo.com/foo-6.html",
          ]),
        ]);
      });
      it("Test", function () {
        expect(popupModule.__get__("urlType")).toBe("blacklist");
        const url = popupModule.__get__("url");
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", [
            "https://foo.com/foo.html",
            "https://foo.com/foo-2.html",
          ]),
          new url("notify", [
            "https://foo.com/foo-3.html",
            "https://foo.com/foo-4.html",
          ]),
          new url("referer", [
            "https://foo.com/foo-5.html",
            "https://foo.com/foo-6.html",
          ]),
        ]);
        function_ = popupModule.__get__("deleteUrl");
        const eKey = "blacklist_https://foo.com/foo.html";
        function_(eKey);
        expect(popupModule.__get__("urls")).toStrictEqual([
          new url("blacklist", ["https://foo.com/foo-2.html"]),
          new url("notify", [
            "https://foo.com/foo-3.html",
            "https://foo.com/foo-4.html",
          ]),
          new url("referer", [
            "https://foo.com/foo-5.html",
            "https://foo.com/foo-6.html",
          ]),
        ]);
      });
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
  function mockNotEmptySourcesContainer() {
    let entryElement = document.createElement("p");
    let extraTextElement = document.createElement("p");
    extraTextElement.textContent = "foo";
    entryElement.appendChild(extraTextElement);
    popupModule.__set__("sourcesContainer", entryElement);
  }
  function mockEmptyInfoContainer() {
    let element = document.createElement("div");
    element.setAttribute("class", "info-container");
    popupModule.__set__("infoContainer", element);
  }
  function mockNotEmptyInfoContainer() {
    let entryElement = document.createElement("div");
    let entryValue = document.createElement("p");
    entryValue.textContent = "foo";
    entryElement.appendChild(entryValue);
    popupModule.__set__("infoContainer", entryElement);
  }
});

function initializeMocks() {
  const htmlPathName = "src/popup/popup.html";
  runMockDom(htmlPathName);
  global.browser = mockBrowser();
  const popupJsPathName = "../src/popup/popup.js";
  popupModule = require(popupJsPathName);
}

// TODO extrat to file, This function and all functions in other files.
function getFileContent(fileRelativePath) {
  const fileAbsolutePath = path.resolve(__dirname, fileRelativePath);
  let result = fs.readFileSync(fileAbsolutePath, "utf8");
  result = result.trim();
  return result;
}
