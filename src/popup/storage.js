import { BrowserRepository } from "./repository.js";
import { Message } from "./model.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

// add a tag to the display, and storage
export async function saveUrls(infoContainer, urlsInput, urlType) {
  urlsInput = [...new Set(urlsInput)];  // delete duplicates
  const repository = new BrowserRepository(browser);
  await Promise.all(
    urlsInput.map(async function (url) {
      let id2save = urlType + "_" + url;
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
          await repository.save(id2save, url);
          showStoredInfo(infoContainer, id2save, url);
        }
      } catch (e) {
        reportError(e);
      }
    }),
  );
}
