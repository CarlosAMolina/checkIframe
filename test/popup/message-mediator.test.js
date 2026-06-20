import * as fakeModule from "../fake.js";
import * as messageMediatorModule from "../../src/popup/message-mediator.js";
import * as modelModule from "../../src/popup/model.js";

describe("message-mediator", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    global.browser = fakeModule.fakeBrowser();
  });
  it("sendMessage has expected calls and values", async () => {
    const info2send = "info 2 send";
    const value2send = "value 2 send";
    const message = new modelModule.Message(info2send, value2send);
    const result = await messageMediatorModule.sendMessage(message);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      1,
      new modelModule.Message(info2send, value2send),
    ]);
    expect(result).toEqual({ data: "done sendMessage" });
  });
  it("sendMessage should not call browser.tabs.sendMessage on unsupported protocol", async () => {
    // Scenario: User opens addon popup on an unsupported page (e.g., about:blank).
    // The popup calls sendMessage() to sync config with content script.
    // Since no content script exists on unsupported pages, browser.tabs.sendMessage would fail.
    // Instead, sendMessage() should detect the unsupported protocol and call
    // updateElementsWhenIncompatibleWebPage() without attempting to send the message.
    global.browser.tabs.query = jest.fn(() =>
      Promise.resolve([{ id: 1, url: "about:blank" }]),
    );
    global.browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
    const message = new modelModule.Message("urls", {});
    await messageMediatorModule.sendMessage(message);
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
});
