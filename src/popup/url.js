import { BrowserRepository } from "./repository.js";
import { UrlsOfType } from "./model.js";

export const URL_TYPE_BLACKLIST = "blacklist";
export const URL_TYPE_NOTIFY = "notify";
export const URL_TYPE_REFERER = "referer";
var urls = []; // TODO rm

const URL_TYPES = [URL_TYPE_BLACKLIST, URL_TYPE_NOTIFY, URL_TYPE_REFERER];

export function addUrl(eKey, urls, urlType) {
  urls.forEach(function (url) {
    if (url.type == urlType) {
      url.values.push(eKey.replace(urlType + "_", ""));
    }
  });
  return urls;
}

export function deleteUrl(eKey, urls, urlType) {
  urls.forEach(function (url) {
    if (url.type == urlType) {
      url.values = url.values.filter(
        (value) => value != eKey.replace(urlType + "_", ""),
      );
    }
  });
  return urls;
}

export function getStoredUrls(browser) {
  let result = [];
  return new BrowserRepository(browser).getAll().then((storageItems) => {
    URL_TYPES.forEach(function (urlType) {
      const keysUrl = Object.keys(storageItems).filter((key) =>
        key.includes(urlType + "_"),
      );
      const urls = keysUrl.map((key) => storageItems[key]);
      const urls_of_type = new UrlsOfType(urlType, urls);
      result.push(urls_of_type);
    });
    return result;
  });
}

// TODO? rm work with getStoredUrls
export function getUrls() {
  return urls;
}

// TODO sometimes it is called once and an inner function calls it again,
// TODO review the code to reduce the calls to this method.
export function getUrlTypeActive() {
  const idTypeMap = [
    { idHtml: "buttonUrlsBlacklist", urlType: URL_TYPE_BLACKLIST },
    { idHtml: "buttonUrlsNotify", urlType: URL_TYPE_NOTIFY },
    { idHtml: "buttonUrlsReferer", urlType: URL_TYPE_REFERER },
  ];
  for (let i = 0; i < idTypeMap.length; i++) {
    const { idHtml, urlType } = idTypeMap[i];
    if (document.getElementById(idHtml).checked) {
      return urlType;
    }
  }
  return null;
}

// TODO? rm, store in memory and work with getStoredUrls
export function setUrls(values) {
  urls = values;
}
