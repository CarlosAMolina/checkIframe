var buttonIdHtml;
let htmlIdToChange;
var info2save; // string and array
var info2sendFromPopup;
var infoContainer = document.querySelector(".info-container");
var sourcesContainer = document.querySelector(".sources-container");
var showLogs = 0;
function url(type, values) {
  this.type = type;
  this.values = values;
}
var urls = [];
var urlType = "";
const urlTypeBlacklist = "blacklist";
const urlTypeNotify = "notify";
const urlTypeReferer = "referer";
const urlTypes = [urlTypeBlacklist, urlTypeNotify, urlTypeReferer];
var values2sendFromPopup;

function popupMain() {
  // display previously saved stored info on start-up
  initializePopup();

  // listen to clicks on the buttons, and send the appropriate message to
  // the content script in the web page.
  document.addEventListener("click", (e) => {
    buttonIdHtml = getIdHtmlOfClickedButtonOrImageFromEventClick(e);
    let button = createButton(buttonIdHtml);
    if (button) {
      button.run;
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
  getShowLogs();
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    getUrls(results);
  }, reportError);
}

function getIdHtmlOfClickedButtonOrImageFromEventClick(eventClick) {
  return eventClick.target.id || eventClick.target.parentElement.id;
}

// get saved urls
function getUrls(results) {
  // results: object of keys and values
  urlTypes.forEach(function (arrayValue) {
    var keysUrl = Object.keys(results).filter((key) =>
      key.includes(arrayValue + "_"),
    ); //array
    var urls2save = keysUrl.map((keysUrl) => results[keysUrl]); // array
    var result = new url(arrayValue, urls2save);
    urls.push(result);
    sendInfoAndValue("urls", urls);
  });
}

function createButton(buttonIdHtml) {
  switch (buttonIdHtml) {
    case new ButtonRecheck().buttonIdHtml:
      return new ButtonRecheck();
    case new ButtonClean().buttonIdHtml:
      return new ButtonClean();
    case new ButtonScroll().buttonIdHtml:
      return new ButtonScroll();
    case new ButtonShowSources().buttonIdHtml:
      return new ButtonShowSources();
    case new ButtonShowConfig().buttonIdHtml:
      return new ButtonShowConfig();
    case new ButtonShowLogs().buttonIdHtml:
      return new ButtonShowLogs();
    case new ButtonUrlsNotify().buttonIdHtml:
      return new ButtonUrlsNotify();
    case new ButtonUrlsBlacklist().buttonIdHtml:
      return new ButtonUrlsBlacklist();
    case new ButtonUrlsReferer().buttonIdHtml:
      return new ButtonUrlsReferer();
    case new ButtonAddUrl().buttonIdHtml:
      return new ButtonAddUrl();
    case new ButtonClearAll().buttonIdHtml:
      return new ButtonClearAll();
    default:
      return false;
  }
}

class ButtonClicked {
  constructor(buttonIdHtml) {
    this._buttonIdHtml = buttonIdHtml;
  }

  get buttonIdHtml() {
    return this._buttonIdHtml;
  }

  // TODO change attribute to function
  get run() {
    throw TypeError("Not implemented: method run");
  }

  // TODO change attribute to function
  get logButtonName() {
    console.log(`Clicked button ID Html: ${this.buttonIdHtml}`);
  }
}

class ButtonRecheck extends ButtonClicked {
  constructor() {
    super("buttonRecheck");
  }

  get run() {
    this.logButtonName;
    hideInfo("infoTags");
    info2sendFromPopup = this.buttonIdHtml;
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(sendInfo)
      .catch(reportError);
  }
}

class ButtonClean extends ButtonClicked {
  constructor() {
    super("buttonClean");
  }

  get run() {
    this.logButtonName;
    info2sendFromPopup = this.buttonIdHtml;
    hideInfo("infoScroll");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(sendInfo)
      .catch(reportError);
  }
}

class ButtonScroll extends ButtonClicked {
  constructor() {
    super("buttonScroll");
  }

  get run() {
    this.logButtonName;
    htmlIdToChange = "infoScroll";
    info2sendFromPopup = this.buttonIdHtml;
    showTagsInfo("infoScroll");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(sendInfoSaveAndShowAnswer)
      .catch(reportError);
  }
}

class ButtonShowSources extends ButtonClicked {
  constructor() {
    super("buttonShowSources");
  }

  get run() {
    this.logButtonName;
    htmlIdToChange = "infoTags";
    info2sendFromPopup = this.buttonIdHtml;
    showOrHideInfo("infoTags");
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(sendInfoSaveAndShowAnswer)
      .catch(reportError);
  }
}

class ButtonShowConfig extends ButtonClicked {
  constructor() {
    super("buttonShowConfig");
  }

  get run() {
    this.logButtonName;
    showOrHideInfo("menuConfig");
  }
}

class ButtonShowLogs extends ButtonClicked {
  constructor() {
    super("buttonShowLogs");
  }

  get run() {
    this.logButtonName;
    saveShowLogs();
    values2sendFromPopup = showLogs;
    info2sendFromPopup = buttonIdHtml;
    sendInfoAndValue(info2sendFromPopup, values2sendFromPopup);
  }
}

class ButtonUrlsNotify extends ButtonClicked {
  constructor() {
    super("buttonUrlsNotify");
  }

  get run() {
    this.logButtonName;
    urlType = urlTypeNotify;
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
    enableElementsConfiguration();
  }
}

class ButtonUrlsBlacklist extends ButtonClicked {
  constructor() {
    super("buttonUrlsBlacklist");
  }

  get run() {
    this.logButtonName;
    urlType = urlTypeBlacklist;
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
    enableElementsConfiguration();
  }
}

class ButtonUrlsReferer extends ButtonClicked {
  constructor() {
    super("buttonUrlsReferer");
  }

  get run() {
    this.logButtonName;
    urlType = urlTypeReferer;
    removeShownStoredUrls();
    showStoredUrlsType(urlType + "_");
    enableElementsConfiguration();
  }
}

class ButtonAddUrl extends ButtonClicked {
  constructor() {
    super("buttonAddUrl");
  }

  get run() {
    this.logButtonName;
    saveUrl();
  }
}

class ButtonClearAll extends ButtonClicked {
  constructor() {
    super("buttonClearAll");
  }

  get run() {
    this.logButtonName;
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(clearStorageInfo)
      .catch(reportError);
  }
}

function getShowLogs() {
  var gettingItem = browser.storage.local.get("idShowLogs");
  gettingItem.then((result) => {
    // result: empty object if the searched value is not stored
    if (typeof result.idShowLogs != "undefined") {
      // show log option has never been used
      changeStateBoxLog(result);
    }
  }, reportError);

  // enable/disable logs
  function changeStateBoxLog(results) {
    if (results.idShowLogs == 1) {
      document.getElementById("buttonShowLogs").checked = true;
    } else {
      document.getElementById("buttonShowLogs").checked = false;
    }
    sendInfoAndValue("buttonShowLogs", results.idShowLogs);
  }
}

function clearStorageInfo() {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    deleteAllUrlType(results);
  }, reportError);
}

function deleteAllUrlType(results) {
  var keysUrl = Object.keys(results).filter((key) =>
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
}

function enableElementsConfiguration() {
  enableElements(["pInput", "inputUrl", "buttonAddUrl", "buttonClearAll"]);
}

function showStoredInfo(eKey, eValue) {
  // display box
  var entry = document.createElement("div");
  var entryDisplay = document.createElement("div");
  var entryValue = document.createElement("p");
  var deleteBtn = document.createElement("button");
  var clearFix = document.createElement("div"); // for background color and correct position
  entryValue.textContent = eValue;
  deleteBtn.textContent = "Delete";
  deleteBtn.innerHTML = '<img src="/icons/trash.png"/>';
  entryValue.setAttribute("style", "margin-left: 45px");
  deleteBtn.setAttribute("title", "Delete");
  deleteBtn.setAttribute("class", "floatLeft button");
  deleteBtn.setAttribute("style", "margin: 0% auto");
  clearFix.setAttribute("class", "clearfix");
  entryDisplay.appendChild(deleteBtn);
  entryDisplay.appendChild(entryValue);
  entryDisplay.appendChild(clearFix);
  entry.appendChild(entryDisplay);

  // set up listener for the delete functionality
  deleteBtn.addEventListener("click", (e) => {
    const evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(
      evtTgt.parentNode.parentNode,
    );
    browser.storage.local.remove(eKey);
    deleteUrl(eKey);
    sendInfoAndValue("urls", urls);
  });

  // edit box
  var entryEdit = document.createElement("div");
  var entryEditInput = document.createElement("input");
  var clearFix2 = document.createElement("div");
  var updateBtn = document.createElement("button");
  var cancelBtn = document.createElement("button");
  entryEditInput.setAttribute("class", "input");
  entryEditInput.setAttribute("style", "width:70%");
  updateBtn.innerHTML = '<img src="/icons/ok.png"/>';
  updateBtn.setAttribute("title", "Update");
  updateBtn.setAttribute("class", "button");
  updateBtn.setAttribute("style", "margin: 0% auto");
  cancelBtn.innerHTML = '<img src="/icons/cancel.png"/>';
  cancelBtn.setAttribute("title", "Cancel update");
  cancelBtn.setAttribute("class", "button");
  cancelBtn.setAttribute("class", "floatRight button");
  cancelBtn.setAttribute("style", "margin: 0% auto");
  clearFix2.setAttribute("class", "clearfix");
  entryEdit.appendChild(entryEditInput);
  entryEdit.appendChild(updateBtn);
  entryEdit.appendChild(cancelBtn);
  entryEdit.appendChild(clearFix2);
  entry.appendChild(entryEdit);
  entryEditInput.value = eValue;
  entryEdit.style.display = "none";

  infoContainer.appendChild(entry);

  // set up listeners for the update functionality
  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    entryDisplay.style.display = "block";
    entryEdit.style.display = "none";
    entryEditInput.value = eValue;
  });

  updateBtn.addEventListener("click", () => {
    if (entryEditInput.value !== eValue) {
      // type a different value
      info2save = entryEditInput.value;
      var id2save = eKey.split("_")[0] + "_" + info2save;
      var gettingItem = browser.storage.local.get(id2save);
      gettingItem.then((result) => {
        // result: empty object if the searched value is not stored
        var searchInStorage = Object.keys(result); // array with the searched value if it is stored
        if (searchInStorage.length < 1) {
          // searchInStorage.length < 1 -> no stored
          updateEntry(eKey, id2save);
          entry.parentNode.removeChild(entry);
        }
      });
    }
  });

  // update
  function updateEntry(id2change, id2save) {
    addUrl(id2save);
    var storingInfo = browser.storage.local.set({ [id2save]: info2save });
    storingInfo.then(() => {
      deleteUrl(id2change);
      var removingEntry = browser.storage.local.remove(id2change);
      removingEntry.then(() => {
        showStoredInfo(id2save, info2save);
      }, reportError);
    }, reportError);
    sendInfoAndValue("urls", urls);
  }
}

function hideInfo(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

function showTagsInfo(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}

function sendInfo(tabs) {
  browser.tabs.sendMessage(tabs[0].id, {
    info: info2sendFromPopup,
    values: values2sendFromPopup,
  });
}

function showOrHideInfo(htmlId) {
  if (document.getElementById(htmlId).classList.contains("hidden")) {
    showTagsInfo(htmlId);
  } else {
    hideInfo(htmlId);
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
  info2sendFromPopup = info2send;
  values2sendFromPopup = value2send;
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(sendInfo)
    .catch(reportError);
}

function sendInfoSaveAndShowAnswer(tabs) {
  tabs.forEach(function (arrayValues) {
    browser.tabs
      .sendMessage(arrayValues.id, { info: info2sendFromPopup })
      .then((response) => {
        changeParagraph(response.response, htmlIdToChange);
      })
      .catch(reportError);
  });
}

function changeParagraph(response, htmlId) {
  if (typeof response !== "undefined") {
    // check if the content-script response has been received
    if (info2sendFromPopup === "buttonScroll") {
      document.getElementById(htmlId).textContent = response;
    } else if (info2sendFromPopup === "buttonShowSources") {
      cleanShowSources();
      for (const sourceTag in response) {
        listSourceTagSummary(sourceTag, response[sourceTag]);
      }
    }
  } else {
    document.getElementById(htmlId).textContent =
      "No info received from the content script.";
  }
}

function enableElements(htmlIdsToChange) {
  htmlIdsToChange.forEach(function (arrayValue) {
    document.getElementById(arrayValue).disabled = false;
  });
}

function listSourceTagSummary(tag, sourceTagSummary) {
  showSummaryText(sourceTagSummary.sourcesAllNumber, tag, getExtraText());
  listSources();

  function getExtraText() {
    return sourceTagSummary.sourcesAllNumber === 0
      ? ""
      : sourceTagSummary.sourcesValid.length === 0
        ? "Without not blacklisted sources."
        : "Sources (not blacklisted):";
  }

  function showSummaryText(numberOfElements, tag, text) {
    let entry = document.createElement("p");
    let extraText = document.createElement("p");
    let underlined = document.createElement("u");
    let bold = document.createElement("b");
    const underlined_text = numberOfElements === 1 ? "element" : "elements";
    bold.textContent = tag;
    extraText.textContent = text;
    underlined.textContent = `${numberOfElements} ${underlined_text} with tag `;
    underlined.appendChild(bold);
    entry.appendChild(underlined);
    entry.appendChild(extraText);
    sourcesContainer.appendChild(entry);
  }

  function listSources() {
    for (let index = 0; index < sourceTagSummary.sourcesValid.length; index++) {
      listNewSource(index + 1, sourceTagSummary.sourcesValid[index]);
    }
  }

  function listNewSource(index, url) {
    var entry = document.createElement("div");
    var hyperlink = document.createElement("a");
    var info = document.createElement("p");
    hyperlink.href = url;
    hyperlink.textContent = url;
    info.textContent = `${index} - `;
    info.appendChild(hyperlink);
    entry.appendChild(info);
    sourcesContainer.appendChild(entry);
  }
}

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

function saveShowLogs() {
  if (document.getElementById("buttonShowLogs").checked == true) {
    showLogs = 1;
  } else {
    showLogs = 0;
  }
  var storingInfo = browser.storage.local.set({ ["idShowLogs"]: showLogs });
  storingInfo.then(() => {});
}

function deleteUrl(eKey) {
  urls.forEach(function (arrayValue) {
    if (arrayValue.type == urlType) {
      arrayValue.values = arrayValue.values.filter(
        (value) => value != eKey.replace(urlType + "_", ""),
      );
    }
  });
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
  info2save = document
    .querySelector('div.backGroundGrey textarea[id="inputUrl"]')
    .value.split("\n");
  if (enterKey == 1) {
    info2save.pop(); // delete last value (\n)
  }
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(storeInfo)
    .catch(reportError);
}

// add a tag to the display, and storage
function storeInfo() {
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
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  // TODO replace with reportError
  console.error(`Failed to check this web page: ${error.message}`);
}

// when the pop-up loads, inject a content script into the active tab,
// and add a click handler.
// if we couldn't inject the script, handle the error.
browser.tabs
  .executeScript({ file: "/checkAndBorder.js" })
  .then(popupMain)
  .catch(reportExecuteScriptError);
