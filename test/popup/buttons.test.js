import * as buttonsModule from "../../src/popup/buttons.js";
import * as fakeModule from "../fake.js";

describe("Check ButtonShowLogs", () => {
  it("Check it has correct button ID value", function () {
    expect(new buttonsModule.ButtonShowLogs()._idHtml).toBe("buttonShowLogs");
  });
  describe("Check click has expected calls and values", () => {
    it("If buttonShowLogs is clicked for the first time", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const button = new buttonsModule.ButtonShowLogs();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idShowLogs: true }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: 1 }],
      ]);
    });
    it("If buttonShowLogs is active and clicked to deactivate it", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      const button = new buttonsModule.ButtonShowLogs();
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
        [1, { info: "buttonShowLogs", values: 0 }],
      ]);
    });
  });
  describe("Check initializePopup has expected calls and values", () => {
    it("If buttonShowLogs must be off because the button has never been clicked", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const button = new buttonsModule.ButtonShowLogs();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: 0 }],
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
      const button = new buttonsModule.ButtonShowLogs();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: 1 }],
      ]);
    });
  });
});

describe("Check ButtonHighlightAllAutomatically", () => {
  it("Check it has correct button ID value", function () {
    expect(new buttonsModule.ButtonHighlightAllAutomatically()._idHtml).toBe(
      "buttonHighlightAllAutomatically",
    );
  });
  describe("Check click has expected calls and values", () => {
    it("If buttonHighlightAllAutomatically is clicked for the first time", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const button = new buttonsModule.ButtonHighlightAllAutomatically();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.click()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idHighlightAllAutomatically: true }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: 1 }],
      ]);
    });
    it("If buttonHighlightAllAutomatically is active and clicked to deactivate it", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      const button = new buttonsModule.ButtonHighlightAllAutomatically();
      document.getElementById(
        new buttonsModule.ButtonHighlightAllAutomatically()._idHtml,
      ).checked = true;
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
        [1, { info: "buttonHighlightAllAutomatically", values: 0 }],
      ]);
    });
  });
  describe("Check initializePopup has expected calls and values", () => {
    it("If buttonHighlightAllAutomatically must be off because the button has never been clicked", async () => {
      /* start test required configuration */
      fakeModule.runFakeDom("src/popup/popup.html");
      global.browser = getBrowserMock();
      /* end test required configuration */
      const button = new buttonsModule.ButtonHighlightAllAutomatically();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: 0 }],
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
      const button = new buttonsModule.ButtonHighlightAllAutomatically();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.get.mock.calls.length).toBe(0);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.initializePopup()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.get.mock.calls.length).toBe(1);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonHighlightAllAutomatically", values: 1 }],
      ]);
    });
  });
});

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

function getNewPromise(args) {
  return new Promise(function (resolve, reject) {
    resolve("Start of new Promise");
  });
}
