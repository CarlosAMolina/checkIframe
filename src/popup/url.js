import { BrowserRepository } from "./repository.js";
import { UrlsOfType } from "./model.js";

var URL_TYPE_BLACKLIST = "blacklist";
var URL_TYPE_NOTIFY = "notify";
var URL_TYPE_REFERER = "referer";
var urls = []; // TODO rm

const URL_TYPES = [URL_TYPE_BLACKLIST, URL_TYPE_NOTIFY, URL_TYPE_REFERER];

export function getStoredUrls(browser) {
  let result = [];
  return new BrowserRepository(browser).getAll().then((storageItems) => {
    URL_TYPES.forEach(function (urlType) {
      const keysUrl = Object.keys(storageItems).filter((key) =>
        key.includes(urlType + "_"),
      );
      const urls2save = keysUrl.map((keysUrl) => storageItems[keysUrl]);
      const urls_of_type = new UrlsOfType(urlType, urls2save);
      result.push(urls_of_type);
    });
    return result;
  });
}

// TODO? rm work with getStoredUrls
export function getUrls() {
  return urls;
}
// TODO? rm, store in memory and work with getStoredUrls
export function setUrls(values) {
  urls = values;
}
