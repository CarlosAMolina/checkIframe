import { reportError } from "./log.js";
import { BrowserRepository } from "./repository.js";
import { getUrls, addUrl, setUrls } from "./url.js";
import { Message } from "./model.js";
import { sendMessage } from "./message-mediator.js";
import { showStoredInfo } from "./ui.js";

// TODO drop export when the unique function that calls it is moved here
// add a tag to the display, and storage
export function storeInfo(info2save, infoContainer, urlType) {
  const repository = new BrowserRepository(browser);
  info2save = info2save.filter(function (value, position) {
    // delete duplicates
    return info2save.indexOf(value) == position;
  });
  info2save.forEach(function (arrayValue) {
    var id2save = urlType + "_" + arrayValue;
    repository.get(id2save).then((result) => {
      // result: empty object if the searched value is not stored
      var searchInStorage = Object.keys(result); // array with the searched value if it is stored
      const is_stored = searchInStorage.length > 0;
      if (!is_stored) {
        let urls = getUrls();
        urls = addUrl(id2save, urls, urlType);
        setUrls(urls);
        const message = Message("urls", urls);
        sendMessage(message);
        repository.save(id2save, arrayValue).then(() => {
          showStoredInfo(infoContainer, id2save, arrayValue);
        }, reportError);
      }
    }, reportError);
  });
}
