import * as UrlModule from "../src/popup/url.js";

function mockBrowser(storageItems = null) {
  if (storageItems === null) {
    storageItems = {};
  }
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    storage: {
      local: {
        get: jest.fn(() => Promise.resolve(storageItems)),
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

// Import private code.
const UrlsOfType = require("../src/popup/url.js").__get__("UrlsOfType");

it("getStoredUrls returns expected result", function () {
  const storageItems = {
    blacklist_url1: "url1",
    blacklist_url2: "url2",
    notify_url3: "url3",
    referer_url4: "url4",
  };
  const expectedResult = [
    new UrlsOfType("blacklist", ["url1", "url2"]),
    new UrlsOfType("notify", ["url3"]),
    new UrlsOfType("referer", ["url4"]),
  ];
  UrlModule.getStoredUrls(mockBrowser(storageItems)).then((result) => {
    expect(result).toEqual(expectedResult);
  });
});
