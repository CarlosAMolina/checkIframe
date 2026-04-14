import { BrowserRepository } from "./repository.js";
import { Message } from "./model.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

// add a tag to the display, and storage
export async function saveUrls(infoContainer, urlsInput, urlType) {
  urlsInput = [...new Set(urlsInput)]; // delete duplicates
  const repository = new BrowserRepository(browser);
  let urls = getUrls();
  for (const url of urlsInput) {
    let urlKey = urlType + "_" + url;
    try {
      const isStored = await repository.isStored(urlKey);
      if (!isStored) {
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
  }
}
