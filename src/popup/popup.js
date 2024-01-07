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
    //console.log("initializePopup) getUrls)"); // TODO rm
    getUrls(results);
  }, reportError);
}

function getIdHtmlOfClickedButtonOrImageFromEventClick(eventClick) {
  return eventClick.target.id || eventClick.target.parentElement.id;
}

// get saved urls
function getUrls(results) {
  // results: object of keys and values
  //console.log("urlTypes:"); // TODO rm
  //console.log(urlTypes); // TODO rm
  urlTypes.forEach(function (arrayValue) {
    //console.log("arrayValue:"); // TODO rm
    //console.log(arrayValue); // TODO rm
    var keysUrl = Object.keys(results).filter((key) =>
      key.includes(arrayValue + "_"),
    ); //array
    var urls2save = keysUrl.map((keysUrl) => results[keysUrl]); // array
    var result = new url(arrayValue, urls2save);
    urls.push(result);
    //console.log("getUrls) sendInfoAndValue"); // TODO rm
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
    //console.log("ButtonRecheck) sendInfo)"); // TODO rm
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
    //console.log("ButtonClean) sendInfo)"); // TODO rm
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
    // TODO replace with this.buttonIdHtml?
    info2sendFromPopup = buttonIdHtml;
    //console.log("ButtonShowLogs) sendInfoAndValue"); // TODO rm
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
  //console.log("1. getShowLogs) Init"); // TODO
  //console.log("2. browser.storage.local.get) Then previous line"); // TODO
  var gettingItem = browser.storage.local.get("idShowLogs");
  // result: empty object if the searched value is not stored
  gettingItem.then((result) => {
    //console.log("2. browser.storage.local.get) First line in then"); // TODO
    //console.log("**********************************"); // TODO
    //console.log("browser.storage.local.get) result:"); // TODO
    //console.log(result); // TODO
    // show log option has never been used
    if (typeof result.idShowLogs != "undefined") {
      changeStateBoxLog(result);
    }
    //console.log(document.getElementById("buttonShowLogs")); // TODO rm
    //console.log(document.getElementById("buttonShowLogs").checked); // TODO rm
    //console.log(info2sendFromPopup); // TODO rm
    //console.log(values2sendFromPopup); // TODO rm
  }, reportError);
  //console.log("2. browser.storage.local.get) Then out"); // TODO

  // enable/disable logs
  function changeStateBoxLog(results) {
    //console.log("3. changeStateBoxLog) Init"); // TODO
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
  //console.log("deleteAllUrlType) sendInfoAndValue"); // TODO rm
  sendInfoAndValue("urls", urls);
}

function enableElementsConfiguration() {
  enableElements(["pInput", "inputUrl", "buttonAddUrl", "buttonClearAll"]);
}

function showStoredInfo(eKey, eValue) {
  //console.info("--------------------"); // TODO rm
  //console.info("start showStoredInfo"); // TODO rm
  //console.info("eKey:"); // TODO rm
  //console.info(eKey); // TODO rm
  //console.info("eValue:"); // TODO rm
  //console.info(eValue); // TODO rm
  //console.info("urls:"); // TODO rm
  //console.info(urls); // TODO rm
  //console.info("urls blacklist:"); // TODO rm
  //console.info(urls[0].values); // TODO rm
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
    //console.info("init addEventListener"); // TODO
    //console.info("urls:"); // TODO rm
    //console.info(urls); // TODO rm
    const evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(
      evtTgt.parentNode.parentNode,
    );
    browser.storage.local.remove(eKey);
    //console.info("urls 2:"); // TODO rm
    //console.info(urls); // TODO rm
    // TODO can be this line deleted?
    // Maybe it doesn't do anything becaus the variable `urls` has
    // the url deleted before showStoredInfo is called.
    deleteUrl(eKey);
    //console.log("showStoredInfo) deleteBtn.addEventListener) sendInfoAndValue"); // TODO rm
    //console.info("urls 3:", urls); // TODO rm
    //console.info(urls); // TODO rm
    sendInfoAndValue("urls", urls);
    //console.info("urls 4:"); // TODO rm
    //console.info(urls); // TODO rm
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
  //console.info("end showStoredInfo"); // TODO rm

  // set up listeners for the update functionality
  entryValue.addEventListener("click", () => {
    entryDisplay.style.display = "none";
    entryEdit.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    entryDisplay.style.display = "block";
    entryEdit.style.display = "none";
    // TODO the next line is necessary?
    entryEditInput.value = eValue;
  });

  updateBtn.addEventListener("click", () => {
    //console.info("updateBtn.addEventListener start"); // TODO rm
    //console.info("entryEditInput.value:"); // TODO rm
    //console.info(entryEditInput.value); // TODO rm
    //console.info("eValue:"); // TODO rm
    //console.info(eValue); // TODO rm
    if (entryEditInput.value !== eValue) {
      //console.info("in if"); // TODO rm
      // type a different value
      info2save = entryEditInput.value;
      var id2save = eKey.split("_")[0] + "_" + info2save;
      var gettingItem = browser.storage.local.get(id2save);
      gettingItem.then((result) => {
        //console.info("in gettingItem.then"); // TODO rm
        //console.info("result:"); // TODO rm
        //console.info(result); // TODO rm
        // result: empty object if the searched value is not stored
        var searchInStorage = Object.keys(result); // array with the searched value if it is stored
        //console.info("searchInStorage:"); // TODO rm
        //console.info(searchInStorage); // TODO rm
        if (searchInStorage.length < 1) {
          // searchInStorage.length < 1 -> no stored
          updateEntry(eKey, id2save);
          //console.info('entry:'); // TODO RM
          //console.info(entry); // TODO RM
          //console.info(entry.parentNode); // TODO RM
          entry.parentNode.removeChild(entry);
          //console.info('entry 2:'); // TODO RM
          //console.info(entry); // TODO RM
          //console.info(entry.parentNode); // TODO RM
        }
      });
    }
    //console.info("updateBtn.addEventListener end"); // TODO rm
  });

  // update
  function updateEntry(id2change, id2save) {
    //console.info("in updateEntry"); // TODO rm
    //console.info("id2change:"); // TODO rm
    //console.info(id2change); // TODO rm
    //console.info("id2save:"); // TODO rm
    //console.info(id2save); // TODO rm
    //console.info("info2save:"); // TODO rm
    //console.info(info2save); // TODO rm
    addUrl(id2save);
    // TODO replace [id2save] -> id2save
    var storingInfo = browser.storage.local.set({ [id2save]: info2save });
    storingInfo.then(() => {
      //console.info("in storingInfo.then"); // TODO rm

      deleteUrl(id2change); // Delete url in `var urls`.
      var removingEntry = browser.storage.local.remove(id2change);
      //console.info('browser.storage.local.remove(id2change);'); // TODO rm
      //console.info(browser.storage.local.remove); // TODO rm
      removingEntry.then(() => {
        showStoredInfo(id2save, info2save);
      }, reportError);
    }, reportError);
    //console.log("updateEntry) sendInfoAndValue"); // TODO rm
    sendInfoAndValue("urls", urls);
  }
}

function hideInfo(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

function showTagsInfo(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}

// TODO add then-catch?
function sendInfo(tabs) {
  //console.log("5. browser.tabs.query) First line in then"); // TODO rm
  //console.log("6. sendInfo) Init"); // TODO rm
  //console.log("sendInfo) browser.tabs.sendMessage.calls"); // TODO rm
  //console.log('info2sendFromPopup', info2sendFromPopup); // TODO rm
  //console.log('valuesvalues2sendFromPopup', values2sendFromPopup); // TODO rm
  //console.log("7. browser.tabs.sendMessage) Previous line"); // TODO rm
  browser.tabs.sendMessage(tabs[0].id, {
    info: info2sendFromPopup,
    values: values2sendFromPopup,
  });
  //console.log("7. browser.tabs.sendMessage) End"); // TODO rm
  //console.log("6. sendInfo) End"); // TODO
  // TODO console.log(browser.tabs.sendMessage.mock.calls); // TODO rm
  // TODO console.log("sendInfo) browser.tabs.sendMessage.mock.calls[x][y]"); // TODO rm
  //browser.tabs.sendMessage.mock.calls[0][1] = 'xxxx'; // TODO rm
  //console.log(browser.tabs.sendMessage.mock.calls[4][1]); // TODO rm
  //
  //console.log("5. browser.tabs.query) Last line in then"); // TODO rm
  //console.log("4. sendInfoAndValue) End"); // TODO rm
  //console.log("3. changeStateBoxLog) End"); // TODO
  //console.log("2. browser.storage.local.get) Then last line"); // TODO
  //console.log("1. getShowLogs) End"); // TODO
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
  //console.log("4. sendInfoAndValue) Init"); // TODO rm
  //console.info("sendInfoAndValue) info2send", info2send); // TODO rm
  //console.info("sendInfoAndValue) value2send", value2send); // TODO rm
  info2sendFromPopup = info2send;
  values2sendFromPopup = value2send;
  //console.log("5. browser.tabs.query) Then previous line"); // TODO rm
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

function saveShowLogs() {
  if (document.getElementById("buttonShowLogs").checked == true) {
    //console.info("checked == true"); // TODO
    showLogs = 1;
  } else {
    //console.info("checked != true"); // TODO
    showLogs = 0;
  }
  var storingInfo = browser.storage.local.set({ ["idShowLogs"]: showLogs });
  storingInfo.then(() => {});
}

// Delete url in `var urls`.
function deleteUrl(eKey) {
  //console.info("deteleUrls start"); // TODO rm
  //console.info("urlType:"); // TODO rm
  //console.info(urlType); // TODO rm
  //console.info("eKey:"); // TODO rm
  //console.info(eKey); // TODO rm
  //console.info("urls before loop:"); // TODO rm
  //console.info(urls); // TODO rm
  //console.info("urls blacklist before loop:"); // TODO rm
  //console.info(urls[0].values); // TODO rm
  urls.forEach(function (arrayValue) {
    if (arrayValue.type == urlType) {
      arrayValue.values = arrayValue.values.filter(
        (value) => value != eKey.replace(urlType + "_", ""),
      );
    }
  });
  //console.info("urls after loop:"); // TODO rm
  //console.info(urls); // TODO rm
  //console.info("urls blacklist after loop:"); // TODO rm
  //console.info(urls[0].values); // TODO rm
  //console.info("deteleurls end"); // TODO rm
}

function addUrl(eKey) {
  //console.info('addUrl start'); // TODO rm
  //console.info('urls:'); // TODO rm
  //console.info(urls); // TODO rm
  //console.info("urls blacklist:"); // TODO rm
  //console.info(urls[0].values); // TODO rm
  //console.info('eKey:'); // TODO rm
  //console.info(eKey); // TODO rm
  //console.info('urlType:'); // TODO rm
  //console.info(urlType); // TODO rm
  urls.forEach(function (arrayValue) {
    if (arrayValue.type == urlType) {
      arrayValue.values.push(eKey.replace(urlType + "_", ""));
    }
  });
  //console.info('urls:'); // TODO rm
  //console.info(urls); // TODO rm
  //console.info("urls blacklist:"); // TODO rm
  //console.info(urls[0].values); // TODO rm
  //console.info('addUrl end'); // TODO rm
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
    //console.log("storeInfo) saveInfo) sendInfoAndValue"); // TODO rm
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
