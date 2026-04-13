import { BrowserRepository } from "./repository.js";
import { Message } from "./model.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

// TODO? return promise to wait browser.tabs.query to finish
// save input box info
export function saveUrls(urls, urlType) {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(() => storeInfo(urls, infoContainer, urlType))
    .catch(reportError);
}

// add a tag to the display, and storage
async function storeInfo(info2save, infoContainer, urlType) {
  const repository = new BrowserRepository(browser);
  info2save = info2save.filter(function (value, position) {
    // delete duplicates
    return info2save.indexOf(value) == position;
  });
  await Promise.all(
    info2save.map(async function (arrayValue) {
      let id2save = urlType + "_" + arrayValue;
      try {
        const result = await repository.get(id2save);
        const searchInStorage = Object.keys(result);
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
