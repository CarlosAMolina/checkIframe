import * as urlModule from "../../src/popup/url.js";
import * as modelModule from "../../src/popup/model.js";
import * as fakeModule from "../fake.js";

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
  urlModule
    .getStoredUrls(fakeModule.fakeBrowser({ storageItems: storageItems }))
    .then((result) => {
      expect(result).toEqual(expectedResult);
    });
});
