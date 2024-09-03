import { ButtonShowLogs } from "../src/popup/buttons.js";
import { runMockDom } from "./mockDom.js";

// TODO rm NEW
describe("Check NEWButtonShowLogs", () => {
  it("Check it has correct button ID value", function () {
    const button = new ButtonShowLogs();
    expect(button.buttonIdHtml).toBe("buttonShowLogs");
  });
  describe("Check run has expected calls and values", () => {
    // TODO test when is on and then clicked
    // TODO test initializePopup (when must be on and off)
    it.only("If buttonShowLogs is clicked for the first time", async () => {
      /* start test required configuration */
      runMockDom("src/popup/popup.html");
      global.browser = mockBrowser();
      /* end test required configuration */
      const button = new ButtonShowLogs();
      expect(button.isOn).toBe(false);
      expect(browser.storage.local.set.mock.calls.length).toBe(0);
      expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
      await Promise.all([button.run()]);
      expect(button.isOn).toBe(true);
      expect(browser.storage.local.set.mock.calls).toEqual([
        [{ idShowLogs: 1 }],
      ]);
      expect(browser.tabs.sendMessage.mock.calls).toEqual([
        [1, { info: "buttonShowLogs", values: 1 }],
      ]);
    });
  });
});

// TODO extract to file and use in all tests.
function initializeMocks() {
  runMockDom("src/popup/popup.html");
  global.browser = mockBrowser();
  //const popupJsPathName = "../src/popup/popup.js";
  //const popupModule = require(popupJsPathName);
}

// TODO extract to file and use in all tests.
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
