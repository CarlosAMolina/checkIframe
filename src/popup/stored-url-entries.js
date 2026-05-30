import { addUrl } from "./url.js";
import { BrowserRepository } from "./repository.js";
import { deleteUrl } from "./url.js";
import { getUrlTypeActive } from "./url.js";
import { getUrls } from "./url.js";
import { infoContainer } from "./ui.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";
import { setUrls } from "./url.js";

export function showStoredUrlsType(urlType) {
  new BrowserRepository(browser).getAll().then((storageItems) => {
    const keys = Object.keys(storageItems);
    keys.forEach(function (key) {
      if (key.includes(urlType + "_")) {
        showStoredInfo(infoContainer, key, storageItems[key]);
      }
    });
  }, reportError);
}

// add a tag to the display, and storage
export async function saveUrls(infoContainer, urlsInput, urlType) {
  const uniqueUrls = [...new Set(urlsInput)];
  const repository = new BrowserRepository(browser);
  let urls = getUrls();
  for (const url of uniqueUrls) {
    let urlKey = urlType + "_" + url;
    try {
      const isStored = await repository.isStored(urlKey);
      if (!isStored) {
        urls = addUrl(urlKey, urls, urlType);
        await repository.save(urlKey, url);
        showStoredInfo(infoContainer, urlKey, url);
      }
    } catch (e) {
      reportError(e);
    }
  }
  setUrls(urls);
  sendMessage(new Message("urls", urls));
}

class DynamicButton {
  static createDom() {
    throw new TypeError("Not implemented");
  }

  click() {
    throw new TypeError("Not implemented");
  }
}

class ButtonDelete extends DynamicButton {
  constructor(entry, storageKey) {
    super();
    this._entry = entry;
    this._repository = new BrowserRepository(browser);
    this._storageKey = storageKey;
  }

  static createDom() {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.innerHTML = '<img src="/icons/trash.svg" alt="Delete"/>';
    deleteBtn.setAttribute("title", "Delete");
    return deleteBtn;
  }

  click() {
    this._entry.parentNode.removeChild(this._entry);
    this._repository.delete(this._storageKey).catch((error) => {
      reportError(error);
    });
    const urlType = getUrlTypeActive();
    let urls = getUrls();
    // TODO can be this line deleted?
    // Maybe it doesn't do anything because the variable `urls` has
    // the url deleted before showStoredInfo is called.
    urls = deleteUrl(this._storageKey, urls, urlType);
    setUrls(urls);
    sendMessage(new Message("urls", urls));
  }
}

class ButtonCancel extends DynamicButton {
  constructor(entryDisplay, entryEdit) {
    super();
    this._entryDisplay = entryDisplay;
    this._entryEdit = entryEdit;
  }

  static createDom() {
    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<img src="/icons/cancel.svg" alt="Cancel update"/>';
    cancelBtn.setAttribute("title", "Cancel update");
    return cancelBtn;
  }

  click() {
    this._entryDisplay.style.display = "";
    this._entryEdit.style.display = "none";
  }
}

class ButtonUpdate extends DynamicButton {
  constructor(entry, entryEditInput, storageKey, storageValue) {
    super();
    this._entry = entry;
    this._entryEditInput = entryEditInput;
    this._repository = new BrowserRepository(browser);
    this._storageKey = storageKey;
    this._storageValue = storageValue;
  }

  static createDom() {
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = '<img src="/icons/ok.svg" alt="Update"/>';
    updateBtn.setAttribute("title", "Update");
    return updateBtn;
  }

  click() {
    if (this._info2save === this._storageValue) {
      return;
    }
    this._repository.get(this._key2save).then((result) => {
      // result: empty object if the searched value is not stored
      if (Object.keys(result).length === 0) {
        this._updateEntry();
        this._entry.parentNode.removeChild(this._entry);
      }
    });
  }

  get _info2save() {
    return this._entryEditInput.value;
  }

  get _key2save() {
    return this._storageKey.split("_")[0] + "_" + this._info2save;
  }

  _updateEntry() {
    const urlType = getUrlTypeActive();
    let urls = getUrls();
    urls = addUrl(this._key2save, urls, urlType);
    this._repository.save(this._key2save, this._info2save).then(() => {
      urls = deleteUrl(this._storageKey, urls, urlType);
      this._repository.delete(this._storageKey).then(() => {
        setUrls(urls);
        sendMessage(new Message("urls", urls));
        showStoredInfo(infoContainer, this._key2save, this._info2save);
      }, reportError);
    }, reportError);
  }
}

function showStoredInfo(infoContainer, storageKey, storageValue) {
  // display box
  const entryDisplay = document.createElement("div");
  entryDisplay.setAttribute("class", "section sourceConfig");
  const deleteBtn = ButtonDelete.createDom();
  entryDisplay.appendChild(deleteBtn);
  const entryValue = document.createElement("p");
  entryValue.textContent = storageValue;
  entryDisplay.appendChild(entryValue);
  const entry = document.createElement("div");
  entry.appendChild(entryDisplay);

  // edit box
  const entryEdit = document.createElement("div");
  entryEdit.setAttribute("class", "section sourceConfig");
  const entryEditInput = document.createElement("input");
  entryEdit.appendChild(entryEditInput);
  const updateBtn = ButtonUpdate.createDom();
  entryEdit.appendChild(updateBtn);
  const cancelBtn = ButtonCancel.createDom();
  entryEdit.appendChild(cancelBtn);
  entry.appendChild(entryEdit);
  entryEditInput.value = storageValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  deleteBtn.addEventListener("click", () => {
    new ButtonDelete(entry, storageKey).click();
  });

  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    new ButtonCancel(entryDisplay, entryEdit).click();
  });

  updateBtn.addEventListener("click", () => {
    new ButtonUpdate(entry, entryEditInput, storageKey, storageValue).click();
  });
}
