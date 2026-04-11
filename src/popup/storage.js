import { reportError } from "./log.js";
import { BrowserRepository } from "./repository.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { Message } from "./model.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

// TODO? return promise to wait browser.tabs.query to finish
// save input box info
export function saveUrl(enterKey, urlType) {
  let info2save = document
    .querySelector('textarea[id="inputUrl"]')
    .value.split("\n");
  if (enterKey == 1) {
    info2save.pop(); // delete last value (\n)
  }
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(() => storeInfo(info2save, infoContainer, urlType))
    .catch(reportError);
}

// TODO drop export when the unique function that calls it is moved here
// add a tag to the display, and storage
export async function storeInfo(info2save, infoContainer, urlType) {
  const repository = new BrowserRepository(browser);
  info2save = info2save.filter(function (value, position) {
    // delete duplicates
    return info2save.indexOf(value) == position;
  });
  await Promise.all(
    info2save.map(async function (arrayValue) {
      var id2save = urlType + "_" + arrayValue;
      try {
        const result = await repository.get(id2save);
        var searchInStorage = Object.keys(result);
        const is_stored = searchInStorage.length > 0;
        if (!is_stored) {
          let urls = getUrls();
          urls = addUrl(id2save, urls, urlType);
          setUrls(urls);
          const message = Message("urls", urls);
          sendMessage(message);
          await repository.save(id2save, arrayValue);
          showStoredInfo(infoContainer, id2save, arrayValue);
        }
      } catch (e) {
        reportError(e);
      }
    }),
  );
}
