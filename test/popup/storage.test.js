import * as fakeModule from "../fake.js";

describe("storeInfo", () => {
  let storageModule;
  let mockRepository;
  let mockGetUrls,
    mockAddUrl,
    mockSetUrls,
    mockMessage,
    mockSendMessage,
    mockShowStoredInfo;
  let infoContainer;

  // TODO drop not required mocks
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
    infoContainer = document.createElement("div");
    global.browser = fakeModule.fakeBrowser();

    mockGetUrls = jest.fn(() => []);
    mockAddUrl = jest.fn((id2save, urls, urlType) => [
      { type: urlType, values: [id2save.replace(urlType + "_", "")] },
    ]);
    mockSetUrls = jest.fn();
    mockMessage = jest.fn((info, values) => ({ info, values }));
    mockSendMessage = jest.fn(() => Promise.resolve());
    mockShowStoredInfo = jest.fn();
    mockReportError = jest.fn();

    jest.mock(
      "../../src/popup/repository.js",
      () => ({
        BrowserRepository: jest.fn().mockImplementation(() => mockRepository),
      }),
      { virtual: true },
    );
    jest.mock(
      "../../src/popup/url.js",
      () => ({
        getUrls: mockGetUrls,
        addUrl: mockAddUrl,
        setUrls: mockSetUrls,
      }),
      { virtual: true },
    );
    jest.mock(
      "../../src/popup/model.js",
      () => ({
        Message: mockMessage,
      }),
      { virtual: true },
    );
    jest.mock(
      "../../src/popup/message-mediator.js",
      () => ({
        sendMessage: mockSendMessage,
      }),
      { virtual: true },
    );
    jest.mock(
      "../../src/popup/ui.js",
      () => ({
        showStoredInfo: mockShowStoredInfo,
      }),
      { virtual: true },
    );
    mockRepository = {
      get: jest.fn(() => Promise.resolve({})),
      save: jest.fn(() => Promise.resolve()),
    };

    storageModule = require("../../src/popup/storage.js");
  });

  it("runs without error", async () => {
    const info2save = ["foo", "bar", "foo"]; // includes duplicate
    const urlType = "notify";
    await storageModule.storeInfo(info2save, infoContainer, urlType);
  });
});
