import { infoContainer } from "./ui.js";
import { Message } from "./model.js";
import { reportError } from "./log.js";
import { sendMessage } from "./message-mediator.js";

export function showStoredUrlsType(urlType) {
  browser.storage.local.get({ [urlType]: [] }).then((result) => {
    result[urlType].forEach((url) =>
      showStoredInfo(infoContainer, urlType, url),
    );
  }, reportError);
}

export async function saveUrls(infoContainer, urlsInput, urlType) {
  const uniqueUrls = [...new Set(urlsInput)];
  const result = await browser.storage.local.get({ [urlType]: [] });
  const storedUrls = result[urlType];
  const newUrls = uniqueUrls.filter((url) => !storedUrls.includes(url));
  if (newUrls.length === 0) return;
  try {
    await browser.storage.local.set({ [urlType]: [...storedUrls, ...newUrls] });
    newUrls.forEach((url) => showStoredInfo(infoContainer, urlType, url));
    const allArrays = await readAllUrlArrays();
    sendMessage(new Message("urls", allArrays));
  } catch (e) {
    reportError(e);
  }
}

function readAllUrlArrays() {
  return browser.storage.local.get({ blacklist: [], notify: [], referer: [] });
}

class ButtonDynamic {
  static createDom() {
    throw new TypeError("Not implemented");
  }

  click() {
    throw new TypeError("Not implemented");
  }
}

class ButtonDelete extends ButtonDynamic {
  constructor(entry, urlType, urlValue) {
    super();
    this._entry = entry;
    this._urlType = urlType;
    this._urlValue = urlValue;
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
    readAllUrlArrays()
      .then((urls) => {
        urls[this._urlType] = urls[this._urlType].filter(
          (v) => v !== this._urlValue,
        );
        return browser.storage.local
          .set({ [this._urlType]: urls[this._urlType] })
          .then(() => sendMessage(new Message("urls", urls)));
      })
      .catch(reportError);
  }
}

class ButtonCancel extends ButtonDynamic {
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

class ButtonUpdate extends ButtonDynamic {
  constructor(entry, entryEditInput, urlType, urlValue) {
    super();
    this._entry = entry;
    this._entryEditInput = entryEditInput;
    this._urlType = urlType;
    this._urlValue = urlValue;
  }

  static createDom() {
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = '<img src="/icons/ok.svg" alt="Update"/>';
    updateBtn.setAttribute("title", "Update");
    return updateBtn;
  }

  async click() {
    if (this._newValue === this._urlValue) {
      return;
    }
    const result = await browser.storage.local.get({ [this._urlType]: [] });
    const urls = result[this._urlType];
    if (!urls.includes(this._newValue)) {
      await this._updateEntry(urls);
      this._entry.parentNode.removeChild(this._entry);
    }
  }

  get _newValue() {
    return this._entryEditInput.value;
  }

  async _updateEntry(urls) {
    const updatedUrls = urls.map((v) =>
      v === this._urlValue ? this._newValue : v,
    );
    await browser.storage.local.set({ [this._urlType]: updatedUrls });
    const allArrays = await readAllUrlArrays();
    sendMessage(new Message("urls", allArrays));
    showStoredInfo(infoContainer, this._urlType, this._newValue);
  }
}

function showStoredInfo(infoContainer, urlType, urlValue) {
  // display box
  const entryDisplay = document.createElement("div");
  entryDisplay.setAttribute("class", "section sourceConfig");
  const deleteBtn = ButtonDelete.createDom();
  entryDisplay.appendChild(deleteBtn);
  const entryValue = document.createElement("p");
  entryValue.textContent = urlValue;
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
  entryEditInput.value = urlValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  deleteBtn.addEventListener("click", () => {
    new ButtonDelete(entry, urlType, urlValue).click();
  });

  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    new ButtonCancel(entryDisplay, entryEdit).click();
  });

  updateBtn.addEventListener("click", () => {
    new ButtonUpdate(entry, entryEditInput, urlType, urlValue).click();
  });
}
