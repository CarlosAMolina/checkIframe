import * as fakeModule from "../fake.js";
import * as modelModule from "../../src/popup/model.js";

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;
let function_;

describe("Check module import", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  it("sendInfo has expected calls and values", async () => {
    // The first time the popup is initialized I think it has these values.
    function_ = popupModule.__get__("sendInfo");
    const tabs = [{ id: 1234 }];
    let info2sendFromPopup = "urls";
    const values2sendFromPopup = [
      new modelModule.UrlsOfType("blacklist", []),
      new modelModule.UrlsOfType("notify", []),
      new modelModule.UrlsOfType("referer", []),
    ];
    await function_(tabs, info2sendFromPopup, values2sendFromPopup);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      1234,
      {
        info: "urls",
        values: [
          new modelModule.UrlsOfType("blacklist", []),
          new modelModule.UrlsOfType("notify", []),
          new modelModule.UrlsOfType("referer", []),
        ],
      },
    ]);
    expect(browser.tabs.sendMessage.mock.results[0].value).resolves.toEqual({
      data: "done sendMessage",
    });
  });
});

function initializeMocksAndVariables() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
  popupModule = require("../../src/popup/popup.js");
}
