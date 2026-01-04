import * as fakeModule from "../fake.js";
import * as htmlBuilderModule from "../builder.js";
import * as modelModule from "../../src/popup/model.js";

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;
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
    initializeMocksAndVariables();
  });
  it("The DOM has expected values", function () {
    expect(document.getElementById("pInput").textContent).toBe("New values");
  });
  it("The module should be imported without errors and has expected values", function () {
    expect(popupModule.__get__("URL_TYPE_BLACKLIST")).toEqual("blacklist");
  });
  it("popupMain runs without error", function () {
    const function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    const function_ = popupModule.__get__("initializePopup");
    function_();
  });
  describe("Check buttons", () => {
    describe("createButton", () => {
      it.each(buttonIdsHtml)(
        "should return button if valid ID: %p",
        (buttonIdHtml) => {
          const function_ = popupModule.__get__("createButton");
          const result = function_(buttonIdHtml)._idHtml;
          expect(result).toBe(buttonIdHtml);
        },
      );
      it("should not return button if invalid ID", function () {
        const buttonIdHtml = "nonexistent";
        const function_ = popupModule.__get__("createButton");
        const result = function_(buttonIdHtml);
        expect(result).toBe(false);
      });
    });
    it.each(buttonIdsHtml)(
      "click button should not generate error. Button ID %p ",
      (buttonIdHtml) => {
        const createButton = popupModule.__get__("createButton");
        const button = createButton(buttonIdHtml);
        button.click();
      },
    );
    describe("Check ButtonRecheck", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonRecheck");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonRecheck");
      });
      it("Check click has expected calls and values", async () => {
        document.querySelector("#infoTags").classList.remove("hidden");
        expect(document.getElementById("infoTags").className).toBe(
          "section backgroundGray sources-container",
        );
        await button.click();
        const buttonIdHtml = "buttonRecheck";
        expect(document.getElementById("infoTags").className).toBe(
          "section backgroundGray sources-container hidden",
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
        expect(button._idHtml).toBe("buttonClean");
      });
      it("Check click has expected calls and values", async () => {
        document.querySelector("#infoScroll").classList.remove("hidden");
        expect(document.getElementById("infoScroll").className).toBe(
          "section backgroundGray",
        );
        await button.click();
        const buttonIdHtml = "buttonClean";
        expect(document.getElementById("infoScroll").className).toBe(
          "section backgroundGray hidden",
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
        expect(button._idHtml).toBe("buttonScroll");
      });
      describe("Check button click", () => {
        describe("Check if all required data exists", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() =>
              Promise.resolve({ response: "done sendMessage" }),
            );
          });
          it("Check expected calls and values", async () => {
            assertHtmlInitialValues();
            await Promise.all([button.click()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "done sendMessage",
            );
          });
        });
        describe("Check if undefined response.response", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
          });
          it("Check expected calls and values", async () => {
            assertHtmlInitialValues();
            await Promise.all([button.click()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "Internal error. The action could not be executed",
            );
          });
        });
        function assertHtmlInitialValues() {
          const infoScrollBeforeRun = document.getElementById("infoScroll");
          expect(infoScrollBeforeRun.className).toBe(
            "section backgroundGray hidden",
          );
          expect(infoScrollBeforeRun.textContent).toBe("");
        }
        function runAfterRunExpects() {
          expect(document.getElementById("infoScroll").className).toBe(
            "section backgroundGray",
          );
          expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
          const lastCall = browser.tabs.sendMessage.mock.lastCall;
          expect(lastCall).toEqual([tabId, { info: "buttonScroll" }]);
        }
      });
    });
    describe("Check ButtonShowConfig", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonShowConfig");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonShowConfig");
      });
      it("Check click has expected calls and values", function () {
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGray hidden",
        );
        button.click();
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGray",
        );
      });
    });
    describe("Check ButtonUrlsNotify", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonUrlsNotify");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonUrlsNotify");
      });
      describe("Check click has expected calls and values", () => {
        describe("Test removeShownStoredUrls call", () => {
          beforeEach(() => {
            mockNotEmptyInfoContainer();
          });
          it("Test", async () => {
            expect(
              popupModule.__get__("infoContainer").firstChild.textContent,
            ).toBe("foo");
            // TODO use await
            button.click();
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
    describe("Buttons click works correctly", () => {
      beforeEach(() => {
        setUrls = popupModule.__get__("setUrls");
        setUrls([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
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
        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toEqual([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        await deleteButton.click();
        const buttonsAfterClick = infoContainer.getElementsByTagName("button");
        // Test elements have been deleted.
        expect(buttonsAfterClick.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(1);
        expect(browser.storage.local.remove.mock.lastCall).toEqual([eKey]);
        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toEqual([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new modelModule.UrlsOfType("blacklist", []),
              new modelModule.UrlsOfType("notify", []),
              new modelModule.UrlsOfType("referer", []),
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
        document.getElementById("buttonUrlsBlacklist").checked = true;
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toStrictEqual([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        setUrls = popupModule.__get__("setUrls");
        setUrls([
          new modelModule.UrlsOfType("blacklist", [eValue]),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        expect(getUrls()).toStrictEqual([
          new modelModule.UrlsOfType("blacklist", [
            "https://foo.com/test.html",
          ]),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
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
        expect(getUrls()).toStrictEqual([
          new modelModule.UrlsOfType("blacklist", [
            "https://foo.com/test.html",
          ]),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        expect(browser.storage.local.get.mock.calls.length).toBe(0);
        expect(browser.storage.local.set.mock.calls.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        await Promise.all([updateButton.click()]);
        expect(browser.storage.local.get.mock.calls.length).toBe(1);
        const expectedId2save = "blacklist_https://new-url.com/test-2.html";
        expect(browser.storage.local.get.mock.lastCall).toEqual([
          expectedId2save,
        ]);
        // Test updateEntry
        // Test addUrl
        expect(getUrls()).toStrictEqual([
          new modelModule.UrlsOfType("blacklist", [
            "https://new-url.com/test-2.html",
          ]),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
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
        // Test sendMessage
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new modelModule.UrlsOfType("blacklist", [
                "https://new-url.com/test-2.html",
              ]),
              new modelModule.UrlsOfType("notify", []),
              new modelModule.UrlsOfType("referer", []),
            ],
          },
        ]);
        document.getElementById("buttonUrlsBlacklist").checked = false;
        // TODO not tested entry.parentNode.removeChild(entry);
      });
    });
  });
  it("showStoredUrlsType runs without error", function () {
    function_ = popupModule.__get__("showStoredUrlsType");
    function_();
  });
  it("changeParagraph runs without error", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: ["https://frame1.com", "about:blank"],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const response = { frame: frameTagsSummary, iframe: iframeTagsSummary };
    const htmlId = "infoTags";
    function_ = popupModule.__get__("changeParagraph");
    function_("buttonShowSources", response, htmlId);
  });
  describe("Check cleanShowSources", () => {
    beforeEach(() => {
      mockNotEmptySourcesContainer();
    });
    it("should delete children", function () {
      const sourcesContainer = popupModule.__get__("sourcesContainer");
      expect(
        sourcesContainer.children[sourcesContainer.children.length - 2]
          .textContent,
      ).toBe("foo");
      expect(
        sourcesContainer.children[sourcesContainer.children.length - 1]
          .textContent,
      ).toBe("bar");
      function_ = popupModule.__get__("cleanShowSources");
      function_();
      expect(sourcesContainer.firstChild).toBe(null);
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
  it("saveUrl runs without error", function () {
    function_ = popupModule.__get__("saveUrl");
    function_();
  });
  it("storeInfo runs without error", function () {
    function_ = popupModule.__get__("storeInfo");
    function_(["value_1"]);
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

// TODO move to buttons.test.js
describe("setupCopyButtonListeners", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  it("should copy the url to clipboard and show temporary feedback", async () => {
    jest.useFakeTimers();
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    const html = new htmlBuilderModule.HtmlBuilder()
      .with_urls(["https://foo.com"])
      .build();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container.firstElementChild);
    const btn = document.querySelector(".detections button");
    const img = btn.querySelector("img");
    const span = btn.querySelector(".tooltiptext");
    const setup = popupModule.__get__("setupCopyButtonListeners");
    setup();
    btn.click();
    await Promise.resolve(); // Wait a microtask to let Promise.then() handlers click
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://foo.com/",
    );
    expect(btn.disabled).toBe(true);
    expect(img.src.endsWith("/icons/ok.svg")).toBe(true);
    expect(span.textContent).toBe("Copied");
    jest.runAllTimers(); // Advance timers to restore UI.
    await Promise.resolve(); // Wait so the restoration code (in setTimeout) completes.
    expect(btn.disabled).toBe(false);
    expect(img.src.endsWith("/icons/copy.svg")).toBe(true);
    expect(span.textContent).toBe("Copy to clipboard");
    jest.useRealTimers();
  });
});

describe("check buttons", () => {
  beforeAll(() => {
    initializeMocksAndVariables();
  });
  describe("Button", () => {
    it("buttonIdHtml should return expected result", function () {
      const result = getButton()._idHtml;
      expect(result).toBe("idTest");
    });
    it("click should throw error", function () {
      try {
        getButton().click();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe("Not implemented");
      }
    });
    it("_logButtonName should log expected message", function () {
      console.log = jest.fn();
      getButton()._logButtonName();
      expect(console.log).toHaveBeenCalledWith(
        "Clicked button ID Html: idTest",
      );
    });
    function getButton() {
      const ButtonBase = popupModule.__get__("Button");
      class TestButton extends ButtonBase {
        get _idHtml() {
          return "idTest";
        }
      }
      return new TestButton();
    }
  });
  describe("ButtonClearAll", () => {
    it("clearStorageInfo removes matching storage keys, updates urls, and cleans DOM", async () => {
      // Test configuration.
      const storageItems = {
        blacklist_url1: "url1",
        blacklist_url2: "url2",
        notify_url3: "url3", // Should not be removed.
      };
      global.browser = fakeModule.fakeBrowser({ storageItems: storageItems });
      const numberOfBlacklistedUrls = 2;
      popupModule.__set__(
        "infoContainer",
        fakeInfoContainer(numberOfBlacklistedUrls),
      );
      const sendMessageBackup = popupModule.__get__("sendMessage");
      popupModule.__set__("sendMessage", jest.fn());
      // Test.
      const storedUrls =
        await initializeButton("ButtonClearAll")._clearStorageInfo("blacklist");
      const expectedUrls = [
        new modelModule.UrlsOfType("blacklist", []),
        new modelModule.UrlsOfType("notify", ["url3"]),
        new modelModule.UrlsOfType("referer", []),
      ];
      expect(storedUrls).toStrictEqual(expectedUrls);
      expect(popupModule.__get__("getUrls")()).toEqual(expectedUrls);
      expect(popupModule.__get__("sendMessage")).toHaveBeenCalledWith(
        modelModule.Message("urls", expectedUrls),
      );
      // Assert infoContainer URLs were removed.
      expect(popupModule.__get__("infoContainer").children.length).toBe(0);
      // Undo test specific config.
      global.browser = fakeModule.fakeBrowser();
      fakeModule.runFakeDom("src/popup/popup.html");
      popupModule.__set__("sendMessage", sendMessageBackup);
    });
  });
  describe("ButtonShowSources", () => {
    it("has expected button ID", function () {
      expect(initializeButton("ButtonShowSources")._idHtml).toBe(
        "buttonShowSources",
      );
    });
    describe("click behaviour is correct", () => {
      beforeEach(() => {
        initializeDomAndBrowser();
      });
      afterEach(() => {
        initializeDomAndBrowser();
      });
      it("should show (i)frames information in the HTML if all required data exists", async () => {
        // Previous steps.
        const sendMessageResponse = {
          response: {
            frame: {
              sourcesAllNumber: 2,
              sourcesValid: ["https://frame1.com", "about:blank"],
            },
            iframe: { sourcesAllNumber: 0, sourcesValid: [] },
          },
        };
        browser = fakeModule.fakeBrowser({
          sendMessageResponse: sendMessageResponse,
        });
        mockNotEmptySourcesContainer();
        expect(
          popupModule.__get__("sourcesContainer").firstChild.textContent,
        ).toBe("foo");
        // Test.
        await Promise.all([initializeButton("ButtonShowSources").click()]);
        const result = popupModule.__get__("sourcesContainer").innerHTML;
        const expectedResult = new htmlBuilderModule.HtmlBuilder()
          .with_total(2)
          .with_element("Frame")
          .with_number("frames", 2)
          .with_not_blacklisted("frames", 2)
          .with_urls(["https://frame1.com", "about:blank"])
          .with_element("IFrame")
          .with_number("iframes", 0)
          .build()
          .replace(/svg" \//g, 'svg"');
        expect(result).toBe(expectedResult);
        assertIsHidden("infoTags");
        assertSendMessageCall();
      });
      it("should set error message in HTML if incorrect response", async () => {
        // Previous steps.
        browser = fakeModule.fakeBrowser({
          sendMessageResponse: {},
        });
        // Test.
        await Promise.all([initializeButton("ButtonShowSources").click()]);
        expect(document.getElementById("infoTags").textContent).toBe(
          "Internal error. The action could not be executed",
        );
        assertIsHidden("infoTags");
        assertSendMessageCall();
      });
      function assertIsHidden(htmlId) {
        expect(
          document.getElementById(htmlId).classList.contains("hidden"),
        ).toBe(false);
      }
      function assertSendMessageCall() {
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall).toEqual([tabId, { info: "buttonShowSources" }]);
      }
    });
  });
  function initializeButton(buttonStr) {
    const buttonClass = popupModule.__get__(buttonStr);
    return new buttonClass();
  }
});

function initializeMocksAndVariables() {
  initializeDomAndBrowser();
  popupModule = require("../../src/popup/popup.js");
}

function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}

function mockNotEmptySourcesContainer() {
  const sourcesContainer = popupModule.__get__("sourcesContainer");
  const entryElement = document.createElement("p");
  entryElement.textContent = "foo";
  const entryElement2 = document.createElement("p");
  entryElement2.textContent = "bar";
  sourcesContainer.appendChild(entryElement);
  sourcesContainer.appendChild(entryElement2);
}

function fakeInfoContainer(urlsCount) {
  const containerFake = document.createElement("div");
  for (let i = 0; i < urlsCount; i++) {
    containerFake.appendChild(document.createElement("div"));
  }
  return containerFake;
}
