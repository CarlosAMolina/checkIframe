import * as urlModule from "../src/popup/url.js";
import * as modelModule from "../src/popup/model.js";

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

it("addUrl should add url", function () {
  const urls = [
    new modelModule.UrlsOfType("blacklist", ["https://foo.com/foo.html"]),
    new modelModule.UrlsOfType("notify", []),
    new modelModule.UrlsOfType("referer", []),
  ];
  const eKey = "blacklist_https://foo.com/foo-2.html";
  const result = urlModule.addUrl(eKey, urls, "blacklist");
  const expectedResult = [
    new modelModule.UrlsOfType("blacklist", [
      "https://foo.com/foo.html",
      "https://foo.com/foo-2.html",
    ]),
    new modelModule.UrlsOfType("notify", []),
    new modelModule.UrlsOfType("referer", []),
  ];
  expect(result).toEqual(expectedResult);
});

it("deleteUrl should delete url", () => {
  const urls = [
    new modelModule.UrlsOfType("blacklist", [
      "https://foo.com/foo.html",
      "https://foo.com/foo-2.html",
    ]),
    new modelModule.UrlsOfType("notify", [
      "https://foo.com/foo-3.html",
      "https://foo.com/foo-4.html",
    ]),
    new modelModule.UrlsOfType("referer", [
      "https://foo.com/foo-5.html",
      "https://foo.com/foo-6.html",
    ]),
  ];
  const eKey = "blacklist_https://foo.com/foo.html";
  const result = urlModule.deleteUrl(eKey, urls, "blacklist");
  const expectedResult = [
    new modelModule.UrlsOfType("blacklist", ["https://foo.com/foo-2.html"]),
    new modelModule.UrlsOfType("notify", [
      "https://foo.com/foo-3.html",
      "https://foo.com/foo-4.html",
    ]),
    new modelModule.UrlsOfType("referer", [
      "https://foo.com/foo-5.html",
      "https://foo.com/foo-6.html",
    ]),
  ];
  expect(result).toEqual(expectedResult);
});

it("getStoredUrls returns expected result", function () {
  const storageItems = {
    blacklist_url1: "url1",
    blacklist_url2: "url2",
    notify_url3: "url3",
    referer_url4: "url4",
  };
  const expectedResult = [
    new modelModule.UrlsOfType("blacklist", ["url1", "url2"]),
    new modelModule.UrlsOfType("notify", ["url3"]),
    new modelModule.UrlsOfType("referer", ["url4"]),
  ];
  urlModule.getStoredUrls(mockBrowser(storageItems)).then((result) => {
    expect(result).toEqual(expectedResult);
  });
});
