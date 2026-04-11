import * as fakeModule from "../fake.js";

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;
let buttonsModule;
let domModule;
let htmlBuilderModule;
let modelModule;
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
    expect(buttonsModule.__get__("BUTTON_ID_ADD_URL")).toEqual("buttonAddUrl");
  });
  it("popupMain runs without error", function () {
    const function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    const function_ = popupModule.__get__("initializePopup");
    function_();
  });
  describe("Check function showStoredInfo", () => {
    describe("DOM elements are created correctly", () => {
      beforeEach(() => {
        const infoContainer = mockEmptyInfoContainer();
        popupModule.__set__("infoContainer", infoContainer);
      });
      it("If no values to manage", function () {
        const infoContainer = fakeInfoContainer(0);
        expect(infoContainer.innerHTML).toBe("");
        const function_ = buttonsModule.__get__("showStoredInfo");
        function_(infoContainer);
        expect(infoContainer.innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p></p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
      it("If values to manage", function () {
        const infoContainer = fakeInfoContainer(0);
        expect(infoContainer.innerHTML).toBe("");
        const function_ = buttonsModule.__get__("showStoredInfo");
        const eKey = "blacklist_https://foo.com/test.html";
        const eValue = "https://foo.com/test.html";
        function_(infoContainer, eKey, eValue);
        expect(infoContainer.innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p>https://foo.com/test.html</p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
    });
    describe("Buttons click works correctly", () => {
      beforeEach(() => {
        let setUrls = buttonsModule.__get__("setUrls");
        setUrls([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        browser.tabs.sendMessage = jest.fn(() =>
          Promise.resolve({ data: "done sendMessage" }),
        );
      });
      it("Test click deleteBtn", async () => {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        // TODO in some part of the code the urls.blacklist must have de eKey or eValue value. Add this behaviour to the tests.
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        const function_ = buttonsModule.__get__("showStoredInfo");
        const infoContainer = mockNotEmptyInfoContainer();
        function_(infoContainer, eKey, eValue);
        const buttons = infoContainer.getElementsByTagName("button");
        expect(buttons.length).toBe(3);
        expect(buttons[0].title).toBe("Delete");
        expect(buttons[1].title).toBe("Update");
        expect(buttons[2].title).toBe("Cancel update");
        const deleteButton = buttons[0];
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        let getUrls = buttonsModule.__get__("getUrls");
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
        getUrls = buttonsModule.__get__("getUrls");
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
        const infoContainer = mockEmptyInfoContainer();
        expect(infoContainer.getElementsByTagName("p").length).toBe(0);
        const function_ = buttonsModule.__get__("showStoredInfo");
        function_(infoContainer, eKey, eValue);
        const pElements = infoContainer.getElementsByTagName("p");
        const entryValue = pElements[0];
        expect(entryValue.textContent).toBe("https://foo.com/test.html");
        const indexDivElementToCheck = 1;
        expect(
          infoContainer
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        entryValue.click();
        expect(
          infoContainer
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe("display: none;");
      });
      it("Test click cancelBtn", function () {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        const infoContainer = mockEmptyInfoContainer();
        expect(infoContainer.getElementsByTagName("button").length).toBe(0);
        const function_ = buttonsModule.__get__("showStoredInfo");
        function_(infoContainer, eKey, eValue);
        const cancelButton = infoContainer.getElementsByTagName("button")[2];
        expect(cancelButton.title).toBe("Cancel update");
        const indexDivElementToCheck = 1;
        expect(
          infoContainer
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(infoContainer.getElementsByTagName("input")[0].value).toBe(
          "https://foo.com/test.html",
        );
        cancelButton.click();
        expect(
          infoContainer
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(infoContainer.getElementsByTagName("input")[0].value).toBe(
          "https://foo.com/test.html",
        );
      });
      it("Test click updateBtn", async () => {
        document.getElementById("buttonUrlsBlacklist").checked = true;
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        let getUrls = buttonsModule.__get__("getUrls");
        expect(getUrls()).toStrictEqual([
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ]);
        let setUrls = buttonsModule.__get__("setUrls");
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
        const infoContainer = mockEmptyInfoContainer();
        const function_ = buttonsModule.__get__("showStoredInfo");
        function_(infoContainer, eKey, eValue);
        expect(infoContainer.getElementsByTagName("input")[0].value).toBe(
          "https://foo.com/test.html",
        );
        const updateButton = infoContainer.getElementsByTagName("button")[1];
        expect(updateButton.title).toBe("Update");
        const entryEditInputValue = "https://new-url.com/test-2.html";
        infoContainer.getElementsByTagName("input")[0].value =
          entryEditInputValue;
        expect(infoContainer.getElementsByTagName("input")[0].value).toBe(
          entryEditInputValue,
        );
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
  it("reportError logs expected message", function () {
    const function_ = popupModule.__get__("reportError");
    console.error = jest.fn();
    function_("foo message");
    expect(console.error).toHaveBeenCalledWith("Error: foo message");
  });
  it("reportExecuteScriptError runs without error", function () {
    const function_ = popupModule.__get__("reportExecuteScriptError");
    const error = {};
    function_(error);
  });
});

describe("buttons", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  describe("createButton", () => {
    it.each(buttonIdsHtml)(
      "should return button if valid ID: %p",
      (buttonIdHtml) => {
        const function_ = buttonsModule.createButton;
        const result = function_(buttonIdHtml)._idHtml;
        expect(result).toBe(buttonIdHtml);
      },
    );
    it("should not return button if invalid ID", function () {
      const buttonIdHtml = "nonexistent";
      const result = buttonsModule.createButton(buttonIdHtml);
      expect(result).toBe(false);
    });
  });
  it.each(buttonIdsHtml)(
    "click button should not generate error. Button ID %p ",
    (buttonIdHtml) => {
      const createButton = buttonsModule.createButton;
      const button = createButton(buttonIdHtml);
      button.click();
    },
  );
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
      const ButtonBase = buttonsModule.__get__("Button");
      class TestButton extends ButtonBase {
        get _idHtml() {
          return "idTest";
        }
      }
      return new TestButton();
    }
  });
  describe("ButtonClean", () => {
    it("Check it has correct button ID value", function () {
      expect(getButton()._idHtml).toBe("buttonClean");
    });
    it("Check click has expected calls and values", async () => {
      document.querySelector("#infoScroll").classList.remove("hidden");
      expect(document.getElementById("infoScroll").className).toBe(
        "section backgroundGray",
      );
      browser.tabs.sendMessage.mockClear();
      await getButton().click();
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
    function getButton() {
      const classType = buttonsModule.__get__("ButtonClean");
      return new classType();
    }
  });
  describe("ButtonRecheck", () => {
    it("should have correct button ID value", function () {
      expect(getButton()._idHtml).toBe("buttonRecheck");
    });
    it("click should have expected calls and values if show sources was not hidden", async () => {
      // Test configuration.
      const uiModule = require("../../src/popup/ui.js");
      domModule.unhide("infoTags");
      expect(domModule.isHidden("infoTags")).toBe(false);
      const showSourcesSpy = jest.spyOn(uiModule, "showSources");
      // Test.
      await getButton().click();
      expect(domModule.isHidden("infoTags")).toBe(false);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
      const lastCall = browser.tabs.sendMessage.mock.lastCall;
      expect(lastCall[0]).toBe(tabId);
      expect(lastCall[1].info).toBe("buttonRecheck");
      expect(showSourcesSpy).toHaveBeenCalledTimes(1);
      // TODO check and control lastCall[1].values (is affected by other tests that create a big array of aleatory size).
      // Reset test configuration.
      showSourcesSpy.mockRestore();
    });
    function getButton() {
      const classType = buttonsModule.__get__("ButtonRecheck");
      return new classType();
    }
  });
  describe("ButtonScroll", () => {
    it("should have correct button ID", function () {
      expect(getButton()._idHtml).toBe("buttonScroll");
    });
    it("click should have expected calls and values if all required data exists", async () => {
      // Set test config.
      assertHtmlInitialValues();
      global.browser = fakeModule.fakeBrowser({
        sendMessageResponse: { response: "done sendMessage" },
      });
      // Test.
      await Promise.all([getButton().click()]);
      assertTestResult("done sendMessage");
      // Restore test config.
      global.browser = fakeModule.fakeBrowser();
    });
    it("click should have expected calls and values if undefined response", async () => {
      // Set test config.
      assertHtmlInitialValues();
      global.browser = fakeModule.fakeBrowser({
        sendMessageResponse: {},
      });
      const consoleErrorSpy = jest.spyOn(console, "error");
      // Test.
      await Promise.all([getButton().click()]);
      assertTestResult("Internal error. The action could not be executed");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: Error: Incorrect response: {}",
      );
      // Restore test config.
      global.browser = fakeModule.fakeBrowser();
      consoleErrorSpy.mockRestore();
    });
    function getButton() {
      const classType = buttonsModule.__get__("ButtonScroll");
      return new classType();
    }
    function assertHtmlInitialValues() {
      const infoScrollBeforeRun = document.getElementById("infoScroll");
      expect(infoScrollBeforeRun.className).toBe(
        "section backgroundGray hidden",
      );
      expect(infoScrollBeforeRun.textContent).toBe("");
    }
    function assertTestResult(infoScrollTextContent) {
      expect(document.getElementById("infoScroll").className).toBe(
        "section backgroundGray",
      );
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
      const lastCall = browser.tabs.sendMessage.mock.lastCall;
      expect(lastCall).toEqual([tabId, { info: "buttonScroll" }]);
      expect(document.getElementById("infoScroll").textContent).toBe(
        infoScrollTextContent,
      );
    }
  });
  describe("ButtonShowConfig", () => {
    it("should have correct button ID", function () {
      expect(getButton()._idHtml).toBe("buttonShowConfig");
    });
    it("click should have expected calls and values", function () {
      expect(document.getElementById("menuConfig").className).toBe(
        "section backgroundGray hidden",
      );
      getButton().click();
      expect(document.getElementById("menuConfig").className).toBe(
        "section backgroundGray",
      );
    });
    function getButton() {
      const classType = buttonsModule.__get__("ButtonShowConfig");
      return new classType();
    }
  });
  describe("ButtonShowSources", () => {
    it("has expected button ID", function () {
      expect(initializeButton("ButtonShowSources")._idHtml).toBe(
        "buttonShowSources",
      );
    });
    describe("click behaviour is correct", () => {
      let uiModule;
      beforeEach(() => {
        initializeDomAndBrowser();
        uiModule = require("../../src/popup/ui.js");
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
        fakeModule.mockNotEmptySourcesContainer(
          uiModule.__get__("sourcesContainer"),
        );
        expect(
          uiModule.__get__("sourcesContainer").children[
            uiModule.__get__("sourcesContainer").children.length - 2
          ].textContent,
        ).toBe("foo");
        // Test.
        await Promise.all([initializeButton("ButtonShowSources").click()]);
        const result = uiModule.__get__("sourcesContainer").innerHTML;
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
  describe("ButtonUrlsNotify", () => {
    it("should have correct button ID", function () {
      expect(getButton(null)._idHtml).toBe("buttonUrlsNotify");
    });
    it("click should execute removeShownStoredUrls", async () => {
      // Test config.
      const infoContainer = mockNotEmptyInfoContainer();
      expect(infoContainer.firstChild.textContent).toBe("foo");
      // Test.
      // TODO use await (search in all tests all clicks without await)
      getButton(infoContainer).click();
      expect(infoContainer.firstChild).toBe(null);
    });
    function getButton(infoContainer) {
      const classType = buttonsModule.__get__("ButtonUrlsNotify");
      return new classType(infoContainer);
    }
  });
  function initializeButton(buttonStr) {
    const buttonClass = buttonsModule.__get__(buttonStr);
    return new buttonClass();
  }
});

function initializeMocksAndVariables() {
  initializeDomAndBrowser();
  popupModule = require("../../src/popup/popup.js");
  buttonsModule = require("../../src/popup/buttons.js");
  domModule = require("../../src/popup/dom.js");
  htmlBuilderModule = require("../builder.js");
  modelModule = require("../../src/popup/model.js");
}

function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}

function mockEmptyInfoContainer() {
  const infoContainer = document.createElement("div");
  infoContainer.setAttribute("class", "info-container");
  return infoContainer;
}

function mockNotEmptyInfoContainer() {
  const infoContainer = document.createElement("div");
  const entryValue = document.createElement("p");
  entryValue.textContent = "foo";
  infoContainer.appendChild(entryValue);
  return infoContainer;
}

function fakeInfoContainer(urlsCount) {
  const containerFake = document.createElement("div");
  for (let i = 0; i < urlsCount; i++) {
    containerFake.appendChild(document.createElement("div"));
  }
  return containerFake;
}
