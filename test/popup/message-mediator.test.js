import * as fakeModule from "../fake.js";
import * as modelModule from "../../src/popup/model.js";
import * as messageMediatorModule from "../../src/popup/message-mediator.js";

describe("message-mediator", () => {
  beforeEach(() => {
    global.browser = fakeModule.fakeBrowser();
  });
  it("sendMessage has expected calls and values", async () => {
    const info2send = "info 2 send";
    const value2send = "value 2 send";
    const message = modelModule.Message(info2send, value2send);
    await messageMediatorModule.sendMessage(message);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      1,
      {
        info: "info 2 send",
        values: "value 2 send",
      },
    ]);
    expect(browser.tabs.sendMessage.mock.results[0].value).resolves.toEqual({
      data: "done sendMessage",
    });
  });
});
