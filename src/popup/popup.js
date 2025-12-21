import { ButtonHighlightAllAutomatically } from "./buttons.js";
import { ButtonShowLogs } from "./buttons.js";
import { Button } from "./buttons.js";
import { getStrTagsHtml } from "./tagsHtml.js";

// TODO var as const
var infoContainer = document.querySelector(".info-container");
// TODO var as const
var sourcesContainer = document.querySelector(".sources-container");
var urls = [];
var urlType = "";
var values2sendFromPopup;

const urlTypeBlacklist = "blacklist";
const urlTypeNotify = "notify";
const urlTypeReferer = "referer";
const urlTypes = [urlTypeBlacklist, urlTypeNotify, urlTypeReferer];

const _BUTTON_ID_RECHECK = "buttonRecheck";
const _BUTTON_ID_CLEAN = "buttonClean";
const _BUTTON_ID_SCROLL = "buttonScroll";
const _BUTTON_ID_SHOW_SOURCES = "buttonShowSources";
const _BUTTON_ID_SHOW_CONFIG = "buttonShowConfig";
const _BUTTON_ID_SHOW_LOGS = "buttonShowLogs";
const _BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY =
  "buttonHighlightAllAutomatically";
const _BUTTON_ID_URLS_NOTIFY = "buttonUrlsNotify";
const _BUTTON_ID_URLS_BLACKLIST = "buttonUrlsBlacklist";
const _BUTTON_ID_URLS_REFERER = "buttonUrlsReferer";
const _BUTTON_ID_ADD_URL = "buttonAddUrl";
const _BUTTON_ID_CLEAR_ALL = "buttonClearAll";

class _UrlsByType {
  constructor(type, values) {
    this.type = type;
    this.values = values;
  }
}

function popupMain() {
  // display previously saved stored info on start-up
  initializePopup();

  // listen to clicks on the buttons, and send the appropriate message to
  // the content script in the web page.
  document.addEventListener("click", (e) => {
    let buttonIdHtml = getIdHtmlOfClickedButtonOrImageFromEventClick(e);
    let button = createButton(buttonIdHtml);
    if (button) {
      button.click();
    }
  });

  // set up listener for the input box
  document
    .getElementById("inputUrl")
    .addEventListener("keyup", function (event) {
      event.preventDefault();
      // enter key
      if (event.keyCode === 13) {
        saveUrl(1);
      }
    });
}

function initializePopup() {
  setNewElementsMaxWidth();
  new ButtonShowLogs().initializePopup();
  new ButtonHighlightAllAutomatically().initializePopup();
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((storageItems) => {
    urls = getStoredUrls(storageItems);
    sendInfoAndValue("urls", urls);
  }, reportError);
}

// This is necessay to avoid changes in the pop-up width.
function setNewElementsMaxWidth() {
  const maxWidthCurrentWindow =
    document.getElementById("buttonShowConfig").offsetWidth;
  const widthToReduceToAvoidVisualSizeChange = 5;
  const maxWidthNewElements =
    maxWidthCurrentWindow - widthToReduceToAvoidVisualSizeChange;
  const maxWidthNewElementsStr = `${maxWidthNewElements}px`;
  const htmlIdsToModify = ["infoScroll", "menuConfig", "infoTags"];
  for (const htmlId of htmlIdsToModify) {
    document.getElementById(htmlId).style.maxWidth = maxWidthNewElementsStr;
  }
}

function getIdHtmlOfClickedButtonOrImageFromEventClick(eventClick) {
  return eventClick.target.id || eventClick.target.parentElement.id;
}

function getStoredUrls(storageItems) {
  let result = [];
  urlTypes.forEach(function (urlType) {
    var keysUrl = Object.keys(storageItems).filter((key) =>
      key.includes(urlType + "_"),
    ); //array
    var urls2save = keysUrl.map((keysUrl) => storageItems[keysUrl]); // array
    const urls_by_type = new _UrlsByType(urlType, urls2save);
    result.push(urls_by_type);
  });
  return result;
}

//TODO move createButton and all buttons to button.js and update tests.
function createButton(buttonIdHtml) {
  switch (buttonIdHtml) {
    case _BUTTON_ID_RECHECK:
      return new ButtonRecheck();
    case _BUTTON_ID_CLEAN:
      return new ButtonClean();
    case _BUTTON_ID_SCROLL:
      return new ButtonScroll();
    case _BUTTON_ID_SHOW_SOURCES:
      return new ButtonShowSources();
    case _BUTTON_ID_SHOW_CONFIG:
      return new ButtonShowConfig();
    case _BUTTON_ID_SHOW_LOGS:
      return new ButtonShowLogs();
    case _BUTTON_ID_HIGHLIGHT_ALL_AUTOMATICALLY:
      return new ButtonHighlightAllAutomatically();
    case _BUTTON_ID_URLS_NOTIFY:
      return new ButtonUrlsNotify();
    case _BUTTON_ID_URLS_BLACKLIST:
      return new ButtonUrlsBlacklist();
    case _BUTTON_ID_URLS_REFERER:
      return new ButtonUrlsReferer();
    case _BUTTON_ID_ADD_URL:
      return new ButtonAddUrl();
    case _BUTTON_ID_CLEAR_ALL:
      return new ButtonClearAll();
    default:
      return false;
  }
}

class ButtonRecheck extends Button {
  get _idHtml() {
    return _BUTTON_ID_RECHECK;
  }

  click() {
    this.logButtonName();
    hide("infoTags");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => sendInfo(tabs, this._idHtml))
      .catch(reportError);
  }
}

class ButtonClean extends Button {
  get _idHtml() {
    return _BUTTON_ID_CLEAN;
  }

  click() {
    this.logButtonName();
    hide("infoScroll");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => sendInfo(tabs, this._idHtml))
      .catch(reportError);
  }
}

class ButtonScroll extends Button {
  get _idHtml() {
    return _BUTTON_ID_SCROLL;
  }

  click() {
    this.logButtonName();
    let htmlIdToChange = "infoScroll";
    unhide("infoScroll");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) =>
        sendInfoSaveAndShowAnswer(tabs, htmlIdToChange, this._idHtml),
      )
      .catch(reportError);
  }
}

class ButtonShowSources extends Button {
  get _idHtml() {
    return _BUTTON_ID_SHOW_SOURCES;
  }

  click() {
    this.logButtonName();
    let htmlIdToChange = "infoTags";
    showOrHideInfo("infoTags");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) =>
        sendInfoSaveAndShowAnswer(tabs, htmlIdToChange, this._idHtml),
      )
      .catch(reportError);
  }
}

class ButtonShowConfig extends Button {
  get _idHtml() {
    return _BUTTON_ID_SHOW_CONFIG;
  }

  click() {
    this.logButtonName();
    showOrHideInfo("menuConfig");
  }
}

class ButtonUrlsNotify extends Button {
  get _idHtml() {
    return _BUTTON_ID_URLS_NOTIFY;
  }

  click() {
    this.logButtonName();
    urlType = urlTypeNotify;
    unhideSourcesConfigValues();
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonUrlsBlacklist extends Button {
  get _idHtml() {
    return _BUTTON_ID_URLS_BLACKLIST;
  }

  click() {
    this.logButtonName();
    urlType = urlTypeBlacklist;
    unhideSourcesConfigValues();
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonUrlsReferer extends Button {
  get _idHtml() {
    return _BUTTON_ID_URLS_REFERER;
  }

  click() {
    this.logButtonName();
    urlType = urlTypeReferer;
    unhideSourcesConfigValues();
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
  }
}

class ButtonAddUrl extends Button {
  get _idHtml() {
    return _BUTTON_ID_ADD_URL;
  }

  click() {
    this.logButtonName();
    saveUrl();
  }
}

class ButtonClearAll extends Button {
  get _idHtml() {
    return _BUTTON_ID_CLEAR_ALL;
  }

  click() {
    this.logButtonName();
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(clearStorageInfo)
      .catch(reportError);
  }
}

function clearStorageInfo() {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((storageItems) => {
    var keysUrl = Object.keys(storageItems).filter((key) =>
      key.includes(urlType + "_"),
    ); //array
    keysUrl.forEach(function (arrayValue) {
      browser.storage.local.remove(arrayValue);
      infoContainer.removeChild(infoContainer.firstChild);
    });
    urls.forEach(function (arrayValue) {
      if (arrayValue.type == urlType) {
        arrayValue.values = [];
      }
    });
    sendInfoAndValue("urls", urls);
  }, reportError);
}

function unhideSourcesConfigValues() {
  unhide("sourcesConfigValues");
}

function showStoredInfo(eKey, eValue) {
  // display box
  var entry = document.createElement("div");
  var entryDisplay = document.createElement("div");
  var entryValue = document.createElement("p");
  var deleteBtn = document.createElement("button");
  entryDisplay.setAttribute("class", "section sourceConfig");
  entryValue.textContent = eValue;
  deleteBtn.textContent = "Delete";
  deleteBtn.innerHTML = '<img src="/icons/trash.svg" alt="Delete"/>';
  deleteBtn.setAttribute("title", "Delete");
  entryDisplay.appendChild(deleteBtn);
  entryDisplay.appendChild(entryValue);
  entry.appendChild(entryDisplay);

  // set up listener for the delete functionality
  deleteBtn.addEventListener("click", (e) => {
    const evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(
      evtTgt.parentNode.parentNode,
    );
    browser.storage.local.remove(eKey);
    // TODO can be this line deleted?
    // Maybe it doesn't do anything because the variable `urls` has
    // the url deleted before showStoredInfo is called.
    urls = deleteUrl(eKey, urls);
    sendInfoAndValue("urls", urls);
  });

  // edit box
  var entryEdit = document.createElement("div");
  var entryEditInput = document.createElement("input");
  var updateBtn = document.createElement("button");
  var cancelBtn = document.createElement("button");
  entryEdit.setAttribute("class", "section sourceConfig");
  updateBtn.innerHTML = '<img src="/icons/ok.svg" alt="Update"/>';
  updateBtn.setAttribute("title", "Update");
  cancelBtn.innerHTML = '<img src="/icons/cancel.svg" alt="Cancel update"/>';
  cancelBtn.setAttribute("title", "Cancel update");
  entryEdit.appendChild(entryEditInput);
  entryEdit.appendChild(updateBtn);
  entryEdit.appendChild(cancelBtn);
  entry.appendChild(entryEdit);
  entryEditInput.value = eValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  // set up listeners for the update functionality
  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    entryDisplay.style.display = "";
    entryEdit.style.display = "none";
    // TODO the next line is necessary?
    entryEditInput.value = eValue;
  });

  updateBtn.addEventListener("click", () => {
    if (entryEditInput.value !== eValue) {
      // type a different value
      let info2save = entryEditInput.value;
      var id2save = eKey.split("_")[0] + "_" + info2save;
      var gettingItem = browser.storage.local.get(id2save);
      gettingItem.then((result) => {
        // result: empty object if the searched value is not stored
        var searchInStorage = Object.keys(result); // array with the searched value if it is stored
        if (searchInStorage.length < 1) {
          // searchInStorage.length < 1 -> no stored
          updateEntry(eKey, id2save, info2save);
          entry.parentNode.removeChild(entry);
        }
      });
    }
  });

  // update
  function updateEntry(id2change, id2save, info2save) {
    addUrl(id2save);
    // TODO replace [id2save] -> id2save
    var storingInfo = browser.storage.local.set({ [id2save]: info2save });
    storingInfo.then(() => {
      urls = deleteUrl(id2change, urls);
      var removingEntry = browser.storage.local.remove(id2change);
      removingEntry.then(() => {
        showStoredInfo(id2save, info2save);
      }, reportError);
    }, reportError);
    sendInfoAndValue("urls", urls);
  }
}

function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

function unhide(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}

function sendInfo(tabs, info2sendFromPopup) {
  browser.tabs
    .sendMessage(tabs[0].id, {
      info: info2sendFromPopup,
      values: values2sendFromPopup,
    })
    .catch(onSendInfoError);
}

function onSendInfoError(error) {
  console.error(error);
  updateElementsWhenIncompatibleWebPage();
}

function showOrHideInfo(htmlId) {
  if (document.getElementById(htmlId).classList.contains("hidden")) {
    unhide(htmlId);
  } else {
    hide(htmlId);
  }
}

function showStoredUrlsType(type2show) {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    var keys = Object.keys(results);
    keys.forEach(function (arrayValue) {
      if (arrayValue.includes(type2show)) {
        showStoredInfo(arrayValue, results[arrayValue]);
      }
    });
  }, reportError);
}

function sendInfoAndValue(info2send, value2send) {
  values2sendFromPopup = value2send;
  console.log("Sending info", info2send, "and value", value2send);
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => sendInfo(tabs, info2send))
    .catch(reportError);
}

// TODO move login to the buttons.
function sendInfoSaveAndShowAnswer(tabs, htmlIdToChange, info2sendFromPopup) {
  tabs.forEach(function (arrayValues) {
    browser.tabs
      .sendMessage(arrayValues.id, { info: info2sendFromPopup })
      .then((response) => {
        changeParagraph(info2sendFromPopup, response.response, htmlIdToChange);
      })
      .catch(reportError);
  });
}

function changeParagraph(info2sendFromPopup, response, htmlId) {
  if (response === undefined) {
    document.getElementById(htmlId).textContent =
      "Internal error. The action could not be executed";
  } else {
    // check if the content-script response has been received
    if (info2sendFromPopup === "buttonScroll") {
      document.getElementById(htmlId).textContent = response;
    } else if (info2sendFromPopup === "buttonShowSources") {
      cleanShowSources();
      const frameTagSummary = response["frame"];
      const iframeTagSummary = response["iframe"];
      const htmlStr = getStrTagsHtml(frameTagSummary, iframeTagSummary);
      sourcesContainer.insertAdjacentHTML("afterbegin", htmlStr);
      setupCopyButtonListeners();
    }
  }
}

// TODO cleanShowSources and removeShownStoredUrls: extract common function
function cleanShowSources() {
  while (sourcesContainer.firstChild) {
    sourcesContainer.removeChild(sourcesContainer.firstChild);
  }
}

function removeShownStoredUrls() {
  while (infoContainer.firstChild) {
    infoContainer.removeChild(infoContainer.firstChild);
  }
}

function deleteUrl(eKey, urls) {
  urls.forEach(function (arrayValue) {
    if (arrayValue.type == urlType) {
      arrayValue.values = arrayValue.values.filter(
        (value) => value != eKey.replace(urlType + "_", ""),
      );
    }
  });
  return urls;
}

function addUrl(eKey) {
  urls.forEach(function (arrayValue) {
    if (arrayValue.type == urlType) {
      arrayValue.values.push(eKey.replace(urlType + "_", ""));
    }
  });
}

// save input box info
function saveUrl(enterKey) {
  let info2save = document
    .querySelector('textarea[id="inputUrl"]')
    .value.split("\n");
  if (enterKey == 1) {
    info2save.pop(); // delete last value (\n)
  }
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(() => storeInfo(info2save))
    .catch(reportError);
}

// add a tag to the display, and storage
function storeInfo(info2save) {
  function saveInfo(id2save, value2save) {
    addUrl(id2save);
    sendInfoAndValue("urls", urls);
    var storingInfo = browser.storage.local.set({ [id2save]: value2save });
    storingInfo.then(() => {
      showStoredInfo(id2save, value2save);
    }, reportError);
  }
  info2save = info2save.filter(function (value, position) {
    // delete duplicates
    return info2save.indexOf(value) == position;
  });
  info2save.forEach(function (arrayValue) {
    var id2save = urlType + "_" + arrayValue;
    var gettingItem = browser.storage.local.get(id2save);
    gettingItem.then((result) => {
      // result: empty object if the searched value is not stored
      var searchInStorage = Object.keys(result); // array with the searched value if it is stored
      if (searchInStorage.length < 1) {
        // searchInStorage.length < 1 -> no stored;
        saveInfo(id2save, arrayValue);
      }
    }, reportError);
  });
}

function reportError(error) {
  console.error(`Error: ${error}`);
}

// there was an error executing the script.
// display the pop-up's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
  // TODO replace with reportError
  console.error(`Failed to check this web page: ${error.message}`);
  updateElementsWhenIncompatibleWebPage();
  popupMain();
}

function updateElementsWhenIncompatibleWebPage() {
  document.querySelector("#error-content").classList.remove("hidden");
  const elementsToHide = [
    "#popup-content div.oneLineButtons",
    "#infoScroll",
    "#buttonShowSources",
  ];
  for (const element of elementsToHide) {
    document.querySelector(element).classList.add("hidden");
  }
}

function setupCopyButtonListeners() {
  const buttons = document.querySelectorAll(".detections button");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("mouseleave", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("click", function () {
      const url = this.parentElement.querySelector("a").href;
      // Find the anchor tag in the same list item
      // Copy the URL to the clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log("Copied to clipboard: " + url);
          const button = this.parentElement.querySelector("button");
          const image = button.querySelector("img");
          const tooltip = button.querySelector("span");
          const originalText = tooltip.textContent;
          const originalSrc = image.src;
          image.src = "/icons/ok.svg";
          tooltip.textContent = "Copied";
          // Avoid wrong behaviour if the user clicks when the temporal image is displayed.
          button.disabled = true;
          setTimeout(() => {
            image.src = originalSrc;
            tooltip.textContent = originalText;
            button.disabled = false;
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  });
}

// when the pop-up loads, inject a content script into the active tab,
// and add a click handler.
// if we couldn't inject the script, handle the error.
browser.tabs
  .executeScript({ file: "../content_scripts/checkAndBorder.js" })
  .then(popupMain)
  .catch(reportExecuteScriptError);
