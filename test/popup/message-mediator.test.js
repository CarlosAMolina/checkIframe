import * as fakeModule from "../fake.js";
import * as modelModule from "../../src/popup/model.js";
import * as messageMediatorModule from "../../src/popup/message-mediator.js";

describe("message-mediator", () => {
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
  });
  it("sendInfo has expected calls and values", function () {
    // The first time the popup is initialized I think it has these values.
    const tabs = [{ id: 1234 }];
    const info2sendFromPopup = "urls";
    const values2sendFromPopup = [
      new modelModule.UrlsOfType("blacklist", []),
      new modelModule.UrlsOfType("notify", []),
      new modelModule.UrlsOfType("referer", []),
    ];
    messageMediatorModule.sendInfo(
      tabs,
      info2sendFromPopup,
      values2sendFromPopup,
    );
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
