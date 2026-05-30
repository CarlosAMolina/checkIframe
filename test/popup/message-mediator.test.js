import * as fakeModule from "../fake.js";
import * as messageMediatorModule from "../../src/popup/message-mediator.js";
import * as modelModule from "../../src/popup/model.js";

describe("message-mediator", () => {
  beforeEach(() => {
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
});
