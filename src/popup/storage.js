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
      let urlKey = urlType + "_" + url;
      try {
        const storedEntry = await repository.get(urlKey);
        const isStored = Object.keys(storedEntry).length > 0;
        if (!isStored) {
          let urls = getUrls();
          urls = addUrl(urlKey, urls, urlType);
          setUrls(urls);
          const message = Message("urls", urls);
          sendMessage(message);
          await repository.save(urlKey, url);
          showStoredInfo(infoContainer, urlKey, url);
        }
      } catch (e) {
        reportError(e);
      }
    }),
  );
}
