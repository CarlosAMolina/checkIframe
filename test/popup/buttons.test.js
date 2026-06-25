import * as fakeModule from "../fake.js";

// Modules that depend on document need to be loaded in beforeEach
// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let buttonsModule;
let storedUrlEntriesModule;
let modelModule;
let domModule;
let htmlBuilderModule;
const TAB_ID = 1;

function describeOnOffButton(config) {
  const { className, expectedIdHtml, storageKey, messageInfo } = config;
  describe(`Check ${className}`, () => {
    beforeEach(() => {
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = fakeModule.fakeBrowser();
      buttonsModule = require("../../src/popup/buttons.js");
    });
    it("has correct button ID value", function () {
      const buttonClass = buttonsModule._forTesting[className];
      const button = new buttonClass();
      expect(button._idHtml).toBe(expectedIdHtml);
    });
    describe("click", () => {
      it("activates when clicked for the first time", async () => {
        const buttonClass = buttonsModule._forTesting[className];
        const button = new buttonClass();
        expect(button._isOn).toBe(false);
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
        await button.click();
        expect(button._isOn).toBe(true);
        expect(browser.storage.local.set.mock.calls).toEqual([
          [{ [storageKey]: true }],
        ]);
        expect(browser.tabs.sendMessage.mock.calls).toEqual([
          [1, { info: messageInfo, values: true }],
        ]);
      });
      it("deactivates when clicked while active", async () => {
        const buttonClass = buttonsModule._forTesting[className];
        const button = new buttonClass();
        document.getElementById(button._idHtml).checked = true;
        expect(button._isOn).toBe(true);
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
        await button.click();
        expect(button._isOn).toBe(false);
        expect(browser.storage.local.set.mock.calls).toEqual([
          [{ [storageKey]: false }],
        ]);
        expect(browser.tabs.sendMessage.mock.calls).toEqual([
          [1, { info: messageInfo, values: false }],
        ]);
      });
    });
    describe("initializePopup", () => {
      it("stays off when never clicked before", async () => {
        const buttonClass = buttonsModule._forTesting[className];
        const button = new buttonClass();
        expect(button._isOn).toBe(false);
        expect(browser.storage.local.get).not.toHaveBeenCalled();
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
        await button.initializePopup();
        expect(button._isOn).toBe(false);
        expect(browser.storage.local.get).toHaveBeenCalledTimes(1);
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage.mock.calls).toEqual([
          [1, { info: messageInfo, values: false }],
        ]);
      });
      it("restores on state from storage", async () => {
        browser.storage.local.get = jest.fn(() =>
          Promise.resolve({ [storageKey]: true }),
        );
        const buttonClass = buttonsModule._forTesting[className];
        const button = new buttonClass();
        expect(button._isOn).toBe(false);
        expect(browser.storage.local.get).not.toHaveBeenCalled();
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
        await button.initializePopup();
        expect(button._isOn).toBe(true);
        expect(browser.storage.local.get).toHaveBeenCalledTimes(1);
        expect(browser.storage.local.set).not.toHaveBeenCalled();
        expect(browser.tabs.sendMessage.mock.calls).toEqual([
          [1, { info: messageInfo, values: true }],
        ]);
      });
    });
  });
}

describe("saveUrls", () => {
  let infoContainer;
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    storedUrlEntriesModule = require("../../src/popup/stored-url-entries.js");
    infoContainer = document.createElement("div");
    global.browser = fakeModule.fakeBrowser();
  });
  it("sends one message after all URLs are saved, not one per URL", async () => {
    const urls = ["foo", "bar", "baz"];
    const urlType = "notify";
    await storedUrlEntriesModule.saveUrls(infoContainer, urls, urlType);
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
  });
  it("logs error when storage.local.set rejects", async () => {
    console.error = jest.fn();
    global.browser.storage.local.set = jest.fn(() =>
      Promise.reject(new Error("storage write failed")),
    );
    await storedUrlEntriesModule.saveUrls(infoContainer, ["foo"], "notify");
    expect(console.error).toHaveBeenCalled();
  });
  it("does nothing when all URLs are already stored", async () => {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { notify: ["foo", "bar"] },
    });
    await storedUrlEntriesModule.saveUrls(
      infoContainer,
      ["foo", "bar"],
      "notify",
    );
    expect(browser.storage.local.set).not.toHaveBeenCalled();
  });
});

describe("Check removeChildren", () => {
  let infoContainer;
  beforeEach(() => {
    initializeMocksAndVariables();
    infoContainer = fakeModule.mockNotEmptyInfoContainer();
  });
  it("Elements are modified", function () {
    expect(infoContainer.firstChild.textContent).toBe("foo");
    domModule.removeChildren(infoContainer);
    expect(infoContainer.firstChild).toBe(null);
  });
});

describe("Check showStoredUrlsType", () => {
  let uiModule;
  beforeEach(() => {
    initializeMocksAndVariables();
    uiModule = require("../../src/popup/ui.js");
    uiModule.infoContainer.innerHTML = "";
  });
  describe("Test showStoredUrlsType call", () => {
    it("renders no entries when storage is empty for that type", async () => {
      global.browser = fakeModule.fakeBrowser({
        storageItems: { blacklist: [], notify: [], referer: [] },
      });
      storedUrlEntriesModule.showStoredUrlsType("blacklist");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(uiModule.infoContainer.children.length).toBe(0);
    });
    it("renders only entries for the requested type, not others", async () => {
      global.browser = fakeModule.fakeBrowser({
        storageItems: {
          blacklist: ["url1"],
          notify: ["url2", "url3"],
          referer: [],
        },
      });
      storedUrlEntriesModule.showStoredUrlsType("notify");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(uiModule.infoContainer.children.length).toBe(2);
    });
  });
});

describe("ButtonClearAll", () => {
  it("clearStorageInfo removes matching storage keys, updates urls, and cleans DOM", async () => {
    // Test configuration.
    const storageItems = {
      blacklist: ["url1", "url2"],
      notify: ["url3"], // Should not be removed.
      referer: [],
    };
    global.browser = fakeModule.fakeBrowser({ storageItems: storageItems });
    const numberOfBlacklistedUrls = 2;
    const infoContainer = fakeModule.fakeInfoContainer(numberOfBlacklistedUrls);
    const notifySpy = jest
      .spyOn(storedUrlEntriesModule, "notifyContentScriptOfUrlChange")
      .mockResolvedValue(undefined);
    // Test.
    const buttonClass = buttonsModule._forTesting.ButtonClearAll;
    const button = new buttonClass(infoContainer);
    // Assert storage has blacklist values before clearing.
    const storageBefore = await browser.storage.local.get({
      blacklist: [],
      notify: [],
      referer: [],
    });
    expect(storageBefore.blacklist).toStrictEqual(["url1", "url2"]);
    await button._clearStorageInfo("blacklist");
    // Assert storage was cleared for the target type only.
    const storageAfter = await browser.storage.local.get({
      blacklist: [],
      notify: [],
      referer: [],
    });
    expect(storageAfter).toStrictEqual({
      blacklist: [],
      notify: ["url3"],
      referer: [],
    });
    expect(notifySpy).toHaveBeenCalled();
    // Assert infoContainer URLs were removed.
    expect(infoContainer.children.length).toBe(0);
    // Undo test specific config.
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runFakeDom("src/popup/popup.html");
    notifySpy.mockRestore();
  });
});

describeOnOffButton({
  className: "ButtonShowLogs",
  expectedIdHtml: "buttonShowLogs",
  storageKey: "idShowLogs",
  messageInfo: "buttonShowLogs",
});

describeOnOffButton({
  className: "ButtonHighlightAllAutomatically",
  expectedIdHtml: "buttonHighlightAllAutomatically",
  storageKey: "idHighlightAllAutomatically",
  messageInfo: "buttonHighlightAllAutomatically",
});

describe("ButtonAlwaysShowSources", () => {
  let button;
  let buttonElement;
  let domModule = require("../../src/popup/dom.js");
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    const ButtonAlwaysShowSources =
      buttonsModule._forTesting.ButtonAlwaysShowSources;
    button = new ButtonAlwaysShowSources();
    buttonElement = document.getElementById(
      buttonsModule.BUTTON_ID_ALWAYS_SHOW_SOURCES,
    );
  });
  describe("click", () => {
    it("should modify UI as expected and save state when clicked while OFF", async () => {
      // Test configuration.
      setOff(buttonElement);
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(true);
      expect(domModule.isHidden("buttonShowSources")).toBe(true);
      expect(domModule.isHidden("infoTags")).toBe(false);
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(TAB_ID, {
        info: "buttonShowSources",
      });
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: true,
      });
    });
    it("should modify UI as expected when clicked while OFF and page cannot be analyzed", async () => {
      // Test configuration.
      setOff(buttonElement);
      setPageCannotBeAnalyzed();
      const hideSpy = jest.spyOn(domModule, "hide");
      const showSourcesSpy = jest.spyOn(button, "_showSources");
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(true);
      expect(hideSpy).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalledTimes(1);
      // Undo test configuration.
      hideSpy.mockRestore();
      showSourcesSpy.mockRestore();
    });
    it("should modify UI as expected and save state when clicked while ON", async () => {
      // Test configuration.
      setOn(buttonElement);
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(false);
      expect(domModule.isHidden("buttonShowSources")).toBe(false);
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: false,
      });
    });
    it("should modify UI as expected and save state when clicked while ON and page cannot be analyzed", async () => {
      // Test configuration.
      setOn(buttonElement);
      setPageCannotBeAnalyzed();
      const unhideSpy = jest.spyOn(domModule, "unhide");
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(false);
      expect(unhideSpy).not.toHaveBeenCalled();
      // Undo test configuration.
      unhideSpy.mockRestore();
    });
  });
  describe("initializePopup", () => {
    it("should modify UI as expected when storage is true", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: true },
      });
      // Test.
      await button.initializePopup();
      expect(isOn(buttonElement)).toBe(true);
      expect(domModule.isHidden("buttonShowSources")).toBe(true);
      expect(domModule.isHidden("infoTags")).toBe(false);
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(TAB_ID, {
        info: "buttonShowSources",
      });
    });
    it("should modify UI as expected when storage is true and page cannot be analyzed", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: true },
      });
      setPageCannotBeAnalyzed();
      const hideSpy = jest.spyOn(domModule, "hide");
      const showSourcesSpy = jest.spyOn(button, "_showSources");
      // Test.
      await button.initializePopup();
      expect(isOn(buttonElement)).toBe(true);
      expect(hideSpy).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalled();
      // Undo test configuration.
      hideSpy.mockRestore();
      showSourcesSpy.mockRestore();
    });
    it("should set style to OFF when storage is false", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: false },
      });
      // Test.
      await button.initializePopup();
      expect(isOn(buttonElement)).toBe(false);
    });
    it("should set style to OFF when not stored configuration", async () => {
      // Configure test.
      browser = fakeModule.fakeBrowser({
        storageItems: {},
      });
      // Test.
      await button.initializePopup();
      expect(isOn(buttonElement)).toBe(false);
    });
  });
  function isOn(button) {
    return button.checked;
  }
  function setOff(button) {
    button.checked = false;
  }
  function setOn(button) {
    button.checked = true;
  }
  function setPageCannotBeAnalyzed() {
    domModule.unhide("error-content");
  }
});

describe("buttons", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  describe("Button", () => {
    it("buttonIdHtml should return expected result", function () {
      const result = getButton()._idHtml;
      expect(result).toBe("idTest");
    });
    it("click should throw error", function () {
      expect(() => getButton().click()).toThrow("Not implemented");
    });
    it("_logButtonName should log expected message", function () {
      console.log = jest.fn();
      getButton()._logButtonName();
      expect(console.log).toHaveBeenCalledWith(
        "Clicked button ID Html: idTest",
      );
    });
    function getButton() {
      const ButtonBase = buttonsModule._forTesting.Button;
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
        "backgroundGray",
      );
      browser.tabs.sendMessage.mockClear();
      await getButton().click();
      expect(document.getElementById("infoScroll").className).toBe(
        "backgroundGray hidden",
      );
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
      const lastCall = browser.tabs.sendMessage.mock.lastCall;
      expect(lastCall).toEqual([TAB_ID, { info: "buttonClean" }]);
    });
    function getButton() {
      const classType = buttonsModule._forTesting.ButtonClean;
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
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
      const lastCall = browser.tabs.sendMessage.mock.lastCall;
      expect(lastCall).toEqual([TAB_ID, { info: "buttonRecheck" }]);
      expect(showSourcesSpy).toHaveBeenCalledTimes(1);
      // Reset test configuration.
      showSourcesSpy.mockRestore();
    });
    it("click should pass unwrapped sourcesSummary to showSources", async () => {
      // Test configuration.
      const summary = { iframe: { count: 2 }, frame: { count: 0 } };
      global.browser = fakeModule.fakeBrowser({
        sendMessageResponse: summary,
      });
      const uiModule = require("../../src/popup/ui.js");
      domModule.unhide("infoTags");
      const showSourcesSpy = jest.spyOn(uiModule, "showSources");
      // Test.
      await getButton().click();
      expect(showSourcesSpy).toHaveBeenCalledWith(summary);
      // Reset test configuration.
      showSourcesSpy.mockRestore();
      global.browser = fakeModule.fakeBrowser();
    });
    function getButton() {
      const classType = buttonsModule._forTesting.ButtonRecheck;
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
        sendMessageResponse: { text: "done sendMessage", url: null },
      });
      // Test.
      await getButton().click();
      assertTestResult("done sendMessage");
      // Restore test config.
      global.browser = fakeModule.fakeBrowser();
    });
    it("click should have expected calls and values if undefined response", async () => {
      // Set test config.
      assertHtmlInitialValues();
      global.browser = fakeModule.fakeBrowser({
        sendMessageResponse: undefined,
      });
      const consoleErrorSpy = jest.spyOn(console, "error");
      // Test.
      await getButton().click();
      assertTestResult("Internal error. The action could not be executed");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Incorrect response: undefined",
        }),
      );
      // Restore test config.
      global.browser = fakeModule.fakeBrowser();
      consoleErrorSpy.mockRestore();
    });
    function getButton() {
      const classType = buttonsModule._forTesting.ButtonScroll;
      return new classType();
    }
    function assertHtmlInitialValues() {
      const infoScrollBeforeRun = document.getElementById("infoScroll");
      expect(infoScrollBeforeRun.className).toBe("backgroundGray hidden");
      expect(infoScrollBeforeRun.textContent).toBe("");
    }
    function assertTestResult(infoScrollTextContent) {
      expect(document.getElementById("infoScroll").className).toBe(
        "backgroundGray",
      );
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
      const lastCall = browser.tabs.sendMessage.mock.lastCall;
      expect(lastCall).toEqual([TAB_ID, { info: "buttonScroll" }]);
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
        "backgroundGray hidden",
      );
      getButton().click();
      expect(document.getElementById("menuConfig").className).toBe(
        "backgroundGray",
      );
    });
    function getButton() {
      const classType = buttonsModule._forTesting.ButtonShowConfig;
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
        fakeModule.initializeDomAndBrowser();
        uiModule = require("../../src/popup/ui.js");
      });
      afterEach(() => {
        fakeModule.initializeDomAndBrowser();
      });
      it("should show (i)frames information in the HTML if all required data exists", async () => {
        // Previous steps.
        const sendMessageResponse = {
          frame: {
            sourcesAllNumber: 2,
            sourcesValid: ["https://frame1.com", "about:blank"],
          },
          iframe: { sourcesAllNumber: 0, sourcesValid: [] },
        };
        browser = fakeModule.fakeBrowser({
          sendMessageResponse: sendMessageResponse,
        });
        fakeModule.mockNotEmptySourcesContainer(
          uiModule._forTesting.sourcesContainer,
        );
        expect(
          uiModule._forTesting.sourcesContainer.children[
            uiModule._forTesting.sourcesContainer.children.length - 2
          ].textContent,
        ).toBe("foo");
        // Test.
        await initializeButton("ButtonShowSources").click();
        const result = uiModule._forTesting.sourcesContainer.innerHTML.replace(
          />\s+</g,
          "><",
        );
        const expectedResult = new htmlBuilderModule.HtmlBuilder()
          .with_total(2)
          .with_element("Frame")
          .with_number("frames", 2)
          .with_not_blacklisted("frames", 2)
          .with_urls(["https://frame1.com", "about:blank"])
          .with_element("IFrame")
          .with_number("iframes", 0)
          .build()
          .replace(/>\s+</g, "><")
          .replace(/svg" \//g, 'svg"');
        expect(result).toBe(expectedResult);
        assertIsVisible("infoTags");
        assertSendMessageCall();
      });
      it("should set error message in HTML if incorrect response", async () => {
        // Previous steps.
        browser = fakeModule.fakeBrowser({
          sendMessageResponse: {},
        });
        // Test.
        await initializeButton("ButtonShowSources").click();
        expect(document.getElementById("infoTags").textContent).toBe(
          "Internal error. The action could not be executed",
        );
        assertIsVisible("infoTags");
        assertSendMessageCall();
      });
      it("click should NOT send message when hiding (infoTags already visible)", async () => {
        domModule.unhide("infoTags");
        expect(domModule.isHidden("infoTags")).toBe(false);
        await initializeButton("ButtonShowSources").click();
        expect(domModule.isHidden("infoTags")).toBe(true);
        expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
      });
      function assertIsVisible(htmlId) {
        expect(
          document.getElementById(htmlId).classList.contains("hidden"),
        ).toBe(false);
      }
      function assertSendMessageCall() {
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall).toEqual([TAB_ID, { info: "buttonShowSources" }]);
      }
    });
  });
  describe("ButtonUrlsNotify", () => {
    it("should have correct button ID", function () {
      expect(getButton(null)._idHtml).toBe("buttonUrlsNotify");
    });
    it("click should execute removeShownStoredUrls", async () => {
      // Test config.
      const infoContainer = fakeModule.mockNotEmptyInfoContainer();
      expect(infoContainer.firstChild.textContent).toBe("foo");
      // Test.
      getButton(infoContainer).click();
      expect(infoContainer.firstChild).toBe(null);
    });
    function getButton(infoContainer) {
      const classType = buttonsModule._forTesting.ButtonUrlsNotify;
      return new classType(infoContainer);
    }
  });
  function initializeButton(buttonStr) {
    const buttonClass = buttonsModule._forTesting[buttonStr];
    return new buttonClass();
  }
});

describe("showStoredInfo", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  it("module exports expected constants", function () {
    expect(buttonsModule._forTesting.BUTTON_ID_ADD_URL).toEqual("buttonAddUrl");
  });
  describe("DOM elements are created correctly", () => {
    it("If no values to manage", function () {
      const infoContainer = fakeModule.fakeInfoContainer(0);
      expect(infoContainer.innerHTML).toBe("");
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", "");
      expect(infoContainer.innerHTML).toBe(
        '<div><div class="sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p></p></div><div class="sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
      );
    });
    it("If values to manage", function () {
      const infoContainer = fakeModule.fakeInfoContainer(0);
      expect(infoContainer.innerHTML).toBe("");
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      const eValue = "https://foo.com/test.html";
      function_(infoContainer, "blacklist", eValue);
      expect(infoContainer.innerHTML).toBe(
        '<div><div class="sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p>https://foo.com/test.html</p></div><div class="sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
      );
    });
  });
  describe("Buttons click works correctly", () => {
    beforeEach(() => {
      browser.tabs.sendMessage = jest.fn(() =>
        Promise.resolve({ data: "done sendMessage" }),
      );
    });
    it("Test click deleteBtn", async () => {
      const eValue = "https://foo.com/test.html";
      expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      const infoContainer = fakeModule.mockNotEmptyInfoContainer();
      function_(infoContainer, "blacklist", eValue);
      const buttons = infoContainer.getElementsByTagName("button");
      expect(buttons.length).toBe(3);
      expect(buttons[0].title).toBe("Delete");
      expect(buttons[1].title).toBe("Update");
      expect(buttons[2].title).toBe("Cancel update");
      const deleteButton = buttons[0];
      expect(browser.storage.local.set).not.toHaveBeenCalled();
      expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
      await deleteButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const buttonsAfterClick = infoContainer.getElementsByTagName("button");
      // Test elements have been deleted.
      expect(buttonsAfterClick.length).toBe(0);
      expect(browser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(browser.storage.local.set.mock.lastCall).toEqual([
        { blacklist: [] },
      ]);
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
      expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
        TAB_ID,
        new modelModule.Message("urls", {
          blacklist: [],
          notify: [],
          referer: [],
        }),
      ]);
    });
    it("Test click img inside deleteBtn removes entry", async () => {
      const eValue = "https://foo.com/test.html";
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      const infoContainer = fakeModule.mockNotEmptyInfoContainer();
      function_(infoContainer, "blacklist", eValue);
      const img = infoContainer.querySelector('button[title="Delete"] img');
      await img.click();
      const buttonsAfterClick = infoContainer.getElementsByTagName("button");
      expect(buttonsAfterClick.length).toBe(0);
    });
    it("Test click entryValue", function () {
      const eValue = "https://foo.com/test.html";
      const infoContainer = fakeModule.fakeInfoContainer(0);
      expect(infoContainer.getElementsByTagName("p").length).toBe(0);
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", eValue);
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
      const infoContainer = fakeModule.fakeInfoContainer(0);
      expect(infoContainer.getElementsByTagName("button").length).toBe(0);
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", eValue);
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
      const eValue = "https://foo.com/test.html";
      global.browser = fakeModule.fakeBrowser({
        storageItems: { blacklist: [eValue], notify: [], referer: [] },
      });
      const infoContainer = fakeModule.fakeInfoContainer(0);
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", eValue);
      expect(infoContainer.getElementsByTagName("input")[0].value).toBe(eValue);
      const updateButton = infoContainer.getElementsByTagName("button")[1];
      expect(updateButton.title).toBe("Update");
      const entryEditInputValue = "https://new-url.com/test-2.html";
      infoContainer.getElementsByTagName("input")[0].value =
        entryEditInputValue;
      expect(browser.storage.local.get).not.toHaveBeenCalled();
      expect(browser.storage.local.set).not.toHaveBeenCalled();
      await updateButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      // get called twice: once to check if new URL exists, once for readAllUrlArrays
      expect(browser.storage.local.get).toHaveBeenCalledTimes(2);
      expect(browser.storage.local.get.mock.calls[0]).toEqual([
        { blacklist: [] },
      ]);
      expect(browser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(browser.storage.local.set.mock.lastCall).toStrictEqual([
        { blacklist: [entryEditInputValue] },
      ]);
      expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
        TAB_ID,
        new modelModule.Message("urls", {
          blacklist: [entryEditInputValue],
          notify: [],
          referer: [],
        }),
      ]);
      // Assert the entire URL row disappears after editing it (it gets re-added by showStoredInfo with the new value,
      // but that call writes to the module-level infoContainer from ui.js, not the local one in the test.
      expect(infoContainer.children.length).toBe(0);
    });
    it("sendMessage is called after storage write completes, not before", async () => {
      const eValue = "https://foo.com/test.html";
      let resolveSet;
      browser.storage.local.set = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveSet = resolve;
          }),
      );
      const infoContainer = fakeModule.fakeInfoContainer(0);
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", eValue);
      infoContainer.getElementsByTagName("input")[0].value =
        "https://new-url.com/test-2.html";
      const updateButton = infoContainer.getElementsByTagName("button")[1];
      await updateButton.click();
      expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
      resolveSet({});
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
    });
    it("Test click updateBtn does nothing when value is unchanged", async () => {
      const eValue = "https://foo.com/test.html";
      global.browser = fakeModule.fakeBrowser({
        storageItems: { blacklist: [eValue], notify: [], referer: [] },
      });
      const infoContainer = fakeModule.fakeInfoContainer(0);
      const function_ = storedUrlEntriesModule._forTesting.showStoredInfo;
      function_(infoContainer, "blacklist", eValue);
      const updateButton = infoContainer.getElementsByTagName("button")[1];
      await updateButton.click();
      expect(browser.storage.local.get).not.toHaveBeenCalled();
      expect(browser.storage.local.set).not.toHaveBeenCalled();
    });
  });
});

describe("ButtonUrlType click", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    buttonsModule = require("../../src/popup/buttons.js");
  });
  it("unhides sources config and calls showStoredUrlsType for blacklist", () => {
    const infoContainer = document.createElement("div");
    infoContainer.appendChild(document.createElement("span"));
    const button = new buttonsModule._forTesting.ButtonUrlsBlacklist(
      infoContainer,
    );
    button.click();
    const configEl = document.getElementById("sourcesConfigValues");
    expect(configEl.classList.contains("hidden")).toBe(false);
    expect(infoContainer.children.length).toBe(0);
  });
});

describe("ButtonAddUrl click", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    buttonsModule = require("../../src/popup/buttons.js");
  });
  it("reads textarea input and saves URLs to storage", async () => {
    document.querySelector('textarea[id="inputUrl"]').value = "example.com";
    document.getElementById("buttonUrlsBlacklist").checked = true;
    const button = new buttonsModule._forTesting.ButtonAddUrl();
    await button.click();
    expect(browser.storage.local.set).toHaveBeenCalledWith({
      blacklist: ["example.com"],
    });
  });
});

describe("ButtonClearAll click", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser({
      storageItems: { blacklist: ["a.com", "b.com"] },
    });
    buttonsModule = require("../../src/popup/buttons.js");
  });
  it("removes DOM children and clears storage for the active URL type", async () => {
    const infoContainer = document.createElement("div");
    infoContainer.appendChild(document.createElement("span"));
    infoContainer.appendChild(document.createElement("span"));
    document.getElementById("buttonUrlsBlacklist").checked = true;
    const button = new buttonsModule._forTesting.ButtonClearAll(infoContainer);
    await button.click();
    expect(infoContainer.children.length).toBe(0);
    expect(browser.storage.local.set).toHaveBeenCalledWith({ blacklist: [] });
  });
  it("logs error when clearStorageInfo fails", async () => {
    console.error = jest.fn();
    global.browser.storage.local.get = jest.fn(() =>
      Promise.reject(new Error("storage error")),
    );
    const infoContainer = document.createElement("div");
    document.getElementById("buttonUrlsBlacklist").checked = true;
    const button = new buttonsModule._forTesting.ButtonClearAll(infoContainer);
    await button.click();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("getIsStoredOn", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    buttonsModule = require("../../src/popup/buttons.js");
  });
  it("returns false when key is not stored", async () => {
    const result = await buttonsModule._forTesting.getIsStoredOn("idShowLogs");
    expect(result).toBe(false);
  });
  it("returns stored value when key exists", async () => {
    global.browser = fakeModule.fakeBrowser({
      storageItems: { idShowLogs: true },
    });
    const result = await buttonsModule._forTesting.getIsStoredOn("idShowLogs");
    expect(result).toBe(true);
  });
  it("logs error and returns false when storage.local.get rejects", async () => {
    console.error = jest.fn();
    global.browser.storage.local.get = jest.fn(() =>
      Promise.reject(new Error("storage error")),
    );
    const result = await buttonsModule._forTesting.getIsStoredOn("idShowLogs");
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

function initializeMocksAndVariables() {
  fakeModule.initializeDomAndBrowser();
  buttonsModule = require("../../src/popup/buttons.js");
  storedUrlEntriesModule = require("../../src/popup/stored-url-entries.js");
  domModule = require("../../src/popup/dom.js");
  htmlBuilderModule = require("../builder.js");
  modelModule = require("../../src/popup/model.js");
}
