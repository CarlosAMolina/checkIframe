import * as fakeModule from "../fake.js";

// Modules that depend on document need to be loaded in beforeEach
// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let buttonsModule;
let storedUrlEntriesModule;
let infoContainer;
let modelModule;
let domModule;
let htmlBuilderModule;
const tabId = 1;

describe("saveUrls", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    storedUrlEntriesModule = require("../../src/popup/stored-url-entries.js");
    infoContainer = document.createElement("div");
    global.browser = fakeModule.fakeBrowser();
  });
  it("runs without error", async () => {
    const urls = ["foo", "bar", "foo"]; // includes duplicate
    const urlType = "notify";
    await storedUrlEntriesModule.saveUrls(infoContainer, urls, urlType);
  });
  it("sends one message after all URLs are saved, not one per URL", async () => {
    const urls = ["foo", "bar", "baz"];
    const urlType = "notify";
    await storedUrlEntriesModule.saveUrls(infoContainer, urls, urlType);
    expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
  });
});

describe("Check removeChildren", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
    mockNotEmptyInfoContainer();
  });
  it("Elements are modified", function () {
    expect(infoContainer.firstChild.textContent).toBe("foo");
    domModule.removeChildren(infoContainer);
    expect(infoContainer.firstChild).toBe(null);
  });
});

describe("Check showStoredUrlsType", () => {
  // TODO describe("Test showStoredUrlsType call", () => {
  it("showStoredUrlsType runs without error", function () {
    storedUrlEntriesModule.showStoredUrlsType();
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
    const infoContainer = fakeInfoContainer(numberOfBlacklistedUrls);
    const sendMessageBackup = buttonsModule.__get__("sendMessage");
    buttonsModule.__set__("sendMessage", jest.fn());
    // Test.
    const buttonClass = buttonsModule.__get__("ButtonClearAll");
    const button = new buttonClass(infoContainer);
    const storedUrls = await button._clearStorageInfo("blacklist");
    const expectedUrls = { blacklist: [], notify: ["url3"], referer: [] };
    expect(storedUrls).toStrictEqual(expectedUrls);
    expect(buttonsModule.__get__("sendMessage")).toHaveBeenCalledWith(
      new modelModule.Message("urls", expectedUrls),
    );
    // Assert infoContainer URLs were removed.
    expect(infoContainer.children.length).toBe(0);
    // Undo test specific config.
    global.browser = fakeModule.fakeBrowser();
    fakeModule.runFakeDom("src/popup/popup.html");
    buttonsModule.__set__("sendMessage", sendMessageBackup);
  });
});

describe("Check ButtonShowLogs", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = getBrowserMock();
    buttonsModule = require("../../src/popup/buttons.js");
  });
  it("Check it has correct button ID value", function () {
    const buttonClass = buttonsModule.__get__("ButtonShowLogs");
    const button = new buttonClass();
    expect(button._idHtml).toBe("buttonShowLogs");
  });
  describe("Check click has expected calls and values", () => {
    it("If buttonShowLogs is clicked for the first time", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__("ButtonShowLogs");
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idShowLogs: true }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: true }],
      ]);
    });
    it("If buttonShowLogs is active and clicked to deactivate it", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      const buttonClass = buttonsModule.__get__("ButtonShowLogs");
      const button = new buttonClass();
      document.getElementById(button._idHtml).checked = true;
      /* end test required configuration */
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idShowLogs: false }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: false }],
      ]);
    });
  });
  describe("Check initializePopup has expected calls and values", () => {
    it("If buttonShowLogs must be off because the button has never been clicked", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__("ButtonShowLogs");
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: false }],
      ]);
    });
    it("If buttonShowLogs must be on because the button was clicked previously", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      browser.storage.local.get = jest.fn(() =>
        Promise.resolve({ idShowLogs: true }),
      );
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__("ButtonShowLogs");
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: true }],
      ]);
    });
  });
});

describe("Check ButtonHighlightAllAutomatically", () => {
  it("Check it has correct button ID value", function () {
    const buttonClass = buttonsModule.__get__(
      "ButtonHighlightAllAutomatically",
    );
    const button = new buttonClass();
    expect(button._idHtml).toBe("buttonHighlightAllAutomatically");
  });
  describe("Check click has expected calls and values", () => {
    it("If buttonHighlightAllAutomatically is clicked for the first time", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__(
        "ButtonHighlightAllAutomatically",
      );
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idHighlightAllAutomatically: true }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: true }],
      ]);
    });
    it("If buttonHighlightAllAutomatically is active and clicked to deactivate it", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      const buttonClass = buttonsModule.__get__(
        "ButtonHighlightAllAutomatically",
      );
      const button = new buttonClass();
      document.getElementById(button._idHtml).checked = true;
      /* end test required configuration */
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idHighlightAllAutomatically: false }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: false }],
      ]);
    });
  });
  describe("Check initializePopup has expected calls and values", () => {
    it("If buttonHighlightAllAutomatically must be off because the button has never been clicked", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__(
        "ButtonHighlightAllAutomatically",
      );
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: false }],
      ]);
    });
    it("If buttonHighlightAllAutomatically must be on because the button was clicked previously", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      browser.storage.local.get = jest.fn(() =>
        Promise.resolve({ idHighlightAllAutomatically: true }),
      );
      /* end test required configuration */
      const buttonClass = buttonsModule.__get__(
        "ButtonHighlightAllAutomatically",
      );
      const button = new buttonClass();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: true }],
      ]);
    });
  });
});

describe("ButtonAlwaysShowSources", () => {
  let button;
  let buttonElement;
  let domModule = require("../../src/popup/dom.js");
  let hideBackup;
  let unhideBackup;
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
    hideBackup = buttonsModule.__get__("hide");
    unhideBackup = buttonsModule.__get__("unhide");
    const ButtonAlwaysShowSources = buttonsModule.__get__(
      "ButtonAlwaysShowSources",
    );
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
      expect(isHidden("buttonShowSources")).toBe(true);
      expect(isHidden("infoTags")).toBe(false);
      const tabId = 1;
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
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
      const hideSpy = jest.fn();
      buttonsModule.__set__("hide", hideSpy);
      const showSourcesSpy = jest.spyOn(button, "_showSources");
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(true);
      expect(hideSpy).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalledTimes(1);
      // Undo test configuration.
      buttonsModule.__set__("hide", hideBackup);
      hideSpy.mockRestore();
      showSourcesSpy.mockRestore();
    });
    it("should modify UI as expected and save state when clicked while ON", async () => {
      // Test configuration.
      setOn(buttonElement);
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(false);
      expect(isHidden("buttonShowSources")).toBe(false);
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: false,
      });
    });
    it("should modify UI as expected and save state when clicked while ON and page cannot be analyzed", async () => {
      // Test configuration.
      setOn(buttonElement);
      setPageCannotBeAnalyzed();
      const unhideSpy = jest.fn();
      buttonsModule.__set__("unhide", unhideSpy);
      // Test
      await button.click();
      expect(isOn(buttonElement)).toBe(false);
      expect(unhideSpy).not.toHaveBeenCalled();
      // Undo test configuration.
      buttonsModule.__set__("unhide", unhideBackup);
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
      expect(isHidden("buttonShowSources")).toBe(true);
      expect(isHidden("infoTags")).toBe(false);
      const tabId = 1;
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
        info: "buttonShowSources",
      });
    });
    it("should modify UI as expected when storage is true and page cannot be analyzed", async () => {
      // Test configuration.
      browser = fakeModule.fakeBrowser({
        storageItems: { idTagsInfoAlwaysVisible: true },
      });
      setPageCannotBeAnalyzed();
      const hideSpy = jest.fn();
      buttonsModule.__set__("hide", hideSpy);
      const showSourcesSpy = jest.spyOn(button, "_showSources");
      // Test.
      await button.initializePopup();
      expect(isOn(buttonElement)).toBe(true);
      expect(hideSpy).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalled();
      // Undo test configuration.
      buttonsModule.__set__("hide", hideBackup);
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
  function isHidden(idHtml) {
    // TODO remove, use domModule.isHidden, search in other tests too.
    return document.getElementById(idHtml).classList.contains("hidden");
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
    it("click should pass unwrapped sourcesSummary to showSources", async () => {
      // Test configuration.
      const summary = { iframe: { count: 2 }, frame: { count: 0 } };
      global.browser = fakeModule.fakeBrowser({
        sendMessageResponse: { response: summary },
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

describe("Check module import", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  it("The module should be imported without errors and has expected values", function () {
    expect(buttonsModule.__get__("BUTTON_ID_ADD_URL")).toEqual("buttonAddUrl");
  });
  describe("Check function showStoredInfo", () => {
    describe("DOM elements are created correctly", () => {
      it("If no values to manage", function () {
        const infoContainer = fakeInfoContainer(0);
        expect(infoContainer.innerHTML).toBe("");
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        function_(infoContainer, "blacklist", "");
        expect(infoContainer.innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p></p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
      it("If values to manage", function () {
        const infoContainer = fakeInfoContainer(0);
        expect(infoContainer.innerHTML).toBe("");
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        const eValue = "https://foo.com/test.html";
        function_(infoContainer, "blacklist", eValue);
        expect(infoContainer.innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p>https://foo.com/test.html</p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
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
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        const infoContainer = mockNotEmptyInfoContainer();
        function_(infoContainer, "blacklist", eValue);
        const buttons = infoContainer.getElementsByTagName("button");
        expect(buttons.length).toBe(3);
        expect(buttons[0].title).toBe("Delete");
        expect(buttons[1].title).toBe("Update");
        expect(buttons[2].title).toBe("Cancel update");
        const deleteButton = buttons[0];
        expect(browser.storage.local.set.mock.calls.length).toBe(0);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        await deleteButton.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
        const buttonsAfterClick = infoContainer.getElementsByTagName("button");
        // Test elements have been deleted.
        expect(buttonsAfterClick.length).toBe(0);
        expect(browser.storage.local.set.mock.calls.length).toBe(1);
        expect(browser.storage.local.set.mock.lastCall).toEqual([
          { blacklist: [] },
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          new modelModule.Message("urls", {
            blacklist: [],
            notify: [],
            referer: [],
          }),
        ]);
      });
      it("Test click img inside deleteBtn removes entry", async () => {
        const eValue = "https://foo.com/test.html";
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        const infoContainer = mockNotEmptyInfoContainer();
        function_(infoContainer, "blacklist", eValue);
        const img = infoContainer.querySelector('button[title="Delete"] img');
        await img.click();
        const buttonsAfterClick = infoContainer.getElementsByTagName("button");
        expect(buttonsAfterClick.length).toBe(0);
      });
      it("Test click entryValue", function () {
        const eValue = "https://foo.com/test.html";
        const infoContainer = mockEmptyInfoContainer();
        expect(infoContainer.getElementsByTagName("p").length).toBe(0);
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
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
        const infoContainer = mockEmptyInfoContainer();
        expect(infoContainer.getElementsByTagName("button").length).toBe(0);
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
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
        const infoContainer = mockEmptyInfoContainer();
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        function_(infoContainer, "blacklist", eValue);
        expect(infoContainer.getElementsByTagName("input")[0].value).toBe(
          eValue,
        );
        const updateButton = infoContainer.getElementsByTagName("button")[1];
        expect(updateButton.title).toBe("Update");
        const entryEditInputValue = "https://new-url.com/test-2.html";
        infoContainer.getElementsByTagName("input")[0].value =
          entryEditInputValue;
        expect(browser.storage.local.get.mock.calls.length).toBe(0);
        expect(browser.storage.local.set.mock.calls.length).toBe(0);
        await Promise.all([updateButton.click()]);
        await new Promise((resolve) => setTimeout(resolve, 0));
        // get called twice: once to check if new URL exists, once for readAllUrlArrays
        expect(browser.storage.local.get.mock.calls.length).toBe(2);
        expect(browser.storage.local.get.mock.calls[0]).toEqual([
          { blacklist: [] },
        ]);
        expect(browser.storage.local.set.mock.calls.length).toBe(1);
        expect(browser.storage.local.set.mock.lastCall).toStrictEqual([
          { blacklist: [entryEditInputValue] },
        ]);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          new modelModule.Message("urls", {
            blacklist: [entryEditInputValue],
            notify: [],
            referer: [],
          }),
        ]);
        // TODO not tested entry.parentNode.removeChild(entry);
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
        const infoContainer = mockEmptyInfoContainer();
        const function_ = storedUrlEntriesModule.__get__("showStoredInfo");
        function_(infoContainer, "blacklist", eValue);
        infoContainer.getElementsByTagName("input")[0].value =
          "https://new-url.com/test-2.html";
        const updateButton = infoContainer.getElementsByTagName("button")[1];
        await Promise.all([updateButton.click()]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        resolveSet({});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
      });
    });
  });
});

function mockEmptyInfoContainer() {
  const infoContainer = document.createElement("div");
  infoContainer.setAttribute("class", "info-container");
  return infoContainer;
}

function initializeMocksAndVariables() {
  initializeDomAndBrowser();
  buttonsModule = require("../../src/popup/buttons.js");
  storedUrlEntriesModule = require("../../src/popup/stored-url-entries.js");
  domModule = require("../../src/popup/dom.js");
  htmlBuilderModule = require("../builder.js");
  modelModule = require("../../src/popup/model.js");
}

// TODO extract to file and use in all tests.
function getBrowserMock() {
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

function getNewPromise() {
  return new Promise(function (resolve) {
    resolve("Start of new Promise");
  });
}

// TODO re-defined in popup.test.js
function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}

// TODO re-defined in popup.test.js (last line is different)
function mockNotEmptyInfoContainer() {
  // TODO infoContainer is a global variable and this function returns it too, drop global
  infoContainer = document.createElement("div");
  const entryValue = document.createElement("p");
  entryValue.textContent = "foo";
  infoContainer.appendChild(entryValue);
  return infoContainer;
}

// TODO re-defined in popup.test.js
function fakeInfoContainer(urlsCount) {
  const containerFake = document.createElement("div");
  for (let i = 0; i < urlsCount; i++) {
    containerFake.appendChild(document.createElement("div"));
  }
  return containerFake;
}
