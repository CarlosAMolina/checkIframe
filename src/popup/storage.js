import { BrowserRepository } from "./repository.js";
import { Message } from "./model.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

export async function saveUrls(urls, urlType) {
  try {
    await storeInfo(infoContainer, urls, urlType);
  } catch (e) {
    reportError(e);
  }
}

// add a tag to the display, and storage
async function storeInfo(infoContainer, urls, urlType) {
  const repository = new BrowserRepository(browser);
  urls = urls.filter(function (value, position) {
    // delete duplicates
    return urls.indexOf(value) == position;
  });
  await Promise.all(
    urls.map(async function (arrayValue) {
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
