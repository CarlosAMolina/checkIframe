var buttonIdHtml; 
var idElement2Change;
var info2save; // string and array
var info2sendFromPopup;
var infoContainer = document.querySelector('.info-container');
var sourcesContainer = document.querySelector('.sources-container');
var showLogs = 0;
function url(type, values) {
  this.type = type;
  this.values = values;
}
var urls = [];
var urlType = '';
var urlTypeBlacklist = 'blacklist';
var urlTypeNotify = 'notify';
var urlTypeReferer = 'referer';
var urlTypes = [urlTypeBlacklist,urlTypeNotify, urlTypeReferer];
var values2sendFromPopup;


function popupMain() {
  
  // display previously saved stored info on start-up
  initializePopup();
   
  // listen to clicks on the buttons, and send the appropriate message to
  // the content script in the web page.
  document.addEventListener('click', (e) => {

    buttonIdHtml = getIdHtmlOfClickedButtonOrImageFromEventClick(e);

    switch (buttonIdHtml) {
      case 'buttonRecheck':
        buttonRecheckRun();
        break;
      case 'buttonClean':
        buttonCleanRun();
        break;
      case 'buttonScroll':
        buttonScrollRun();
        break;
      case 'buttonShowSources':
        buttonShowSourcesRun();
        break;
      case 'buttonShowConfig':
        buttonShowConfigRun();
        break;
      case 'buttonShowLogs':
        buttonShowLogsRun()
        break;
      case 'buttonUrlsNotify':
        buttonUrlsNotifyRun();
        break;
      case 'buttonUrlsBlacklist':
        buttonUrlsBlacklistRun();
        break;
      case 'buttonUrlsReferer':
        buttonUrlsRefererRun();
        break;
      case 'buttonAddUrl':
        buttonAddUrlRun();
        break;
      case 'buttonClearAll':
        buttonClearAllRun();
        break;
    }

  });

  // set up listener for the input box
  document.getElementById('inputUrl').addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) { // enter key
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

// get saved urls
function getUrls(results){ // results: object of keys and values
  urlTypes.forEach(function(arrayValue){
    var keysUrl = Object.keys(results).filter(key => key.includes(arrayValue+'_')); //array
    var urls2save = keysUrl.map(keysUrl => results[keysUrl]); // array
    var result = new url(arrayValue, urls2save); 
    urls.push(result);
    sendInfoAndValue('urls', urls);
  });
}

function buttonRecheckRun(){
  console.log(`Init ${buttonIdHtml}`);
  idElement2Change='infoTags';
  hideInfo();
  info2sendFromPopup = buttonIdHtml;
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendInfo)
    .catch(reportError);
}

function buttonCleanRun() {
  console.log(`Init ${buttonIdHtml}`);
  idElement2Change = 'infoScroll';
  info2sendFromPopup = buttonIdHtml;
  hideInfo();
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendInfo)
    .catch(reportError);
}

function buttonScrollRun() {
  console.log(`Init ${buttonIdHtml}`);
  idElement2Change = 'infoScroll';
  info2sendFromPopup = buttonIdHtml;
  showTagsInfo();
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendInfoSaveAndShowAnswer)
    .catch(reportError);
}

function buttonShowSourcesRun() {
  console.log(`Init ${buttonIdHtml}`);
  idElement2Change='infoTags';
  info2sendFromPopup = buttonIdHtml;
  showOrHideInfo();
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendInfoSaveAndShowAnswer)
    .catch(reportError);
}

function buttonShowConfigRun() {
  console.log(`Init ${buttonIdHtml}`);
  idElement2Change='menuConfig';
  showOrHideInfo();
}

function buttonShowLogsRun() {
  console.log(`Init ${buttonIdHtml}`);
  saveShowLogs();
  values2sendFromPopup = showLogs;
  info2sendFromPopup = buttonIdHtml;
  sendInfoAndValue(info2sendFromPopup,values2sendFromPopup);
}

function buttonUrlsNotifyRun() {
  console.log(`Init ${buttonIdHtml}`);
  urlType = urlTypeNotify;
  removeShownStoredUrls();
  showStoredUrlsType(urlType+'_');
  enableElementsConfiguration();
}

function buttonUrlsBlacklistRun() {
  console.log(`Init ${buttonIdHtml}`);
  urlType = urlTypeBlacklist;
  removeShownStoredUrls();
  showStoredUrlsType(urlType+'_');
  enableElementsConfiguration();
}

function buttonUrlsRefererRun() {
  console.log(`Init ${buttonIdHtml}`);
  urlType = urlTypeReferer;
  removeShownStoredUrls();
  showStoredUrlsType(urlType+'_');
  enableElementsConfiguration();
}

function buttonAddUrlRun() {
  console.log(`Init ${buttonIdHtml}`);
  saveUrl();
}

function buttonClearAllRun() {
  console.log(`Init ${buttonIdHtml}`);
  browser.tabs.query({active: true, currentWindow: true})
    .then(clearStorageInfo)
    .catch(reportError)
}

function getShowLogs(){
  var gettingItem = browser.storage.local.get('idShowLogs');
  gettingItem.then((result) => { // result: empty object if the searched value is not stored
    if (typeof result.idShowLogs != 'undefined'){ // show log option has never been used
      changeStateBoxLog(result);
    }
  }, reportError);

  // enable/disable logs
  function changeStateBoxLog(results){
    if(results.idShowLogs == 1) {
      document.getElementById('buttonShowLogs').checked = true;
    } else {
      document.getElementById('buttonShowLogs').checked = false;
    }
    sendInfoAndValue('buttonShowLogs',results.idShowLogs);
  }
}

function clearStorageInfo() {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    deleteAllUrlType(results);
  }, reportError);
}

function deleteAllUrlType(results){
  var keysUrl = Object.keys(results).filter(key => key.includes(urlType+'_')); //array
  keysUrl.forEach(function(arrayValue){
    browser.storage.local.remove(arrayValue);
    infoContainer.removeChild(infoContainer.firstChild);   
  });
  urls.forEach(function(arrayValue){
    if (arrayValue.type == urlType) {
      arrayValue.values = [];
    }
  });
  sendInfoAndValue('urls', urls);
}

function enableElementsConfiguration(){
    enableElements(['pInput','inputUrl','buttonAddUrl','buttonClearAll']);
}

function showStoredInfo(eKey, eValue) {

  // display box
  var entry = document.createElement('div');
  var entryDisplay = document.createElement('div');
  var entryValue = document.createElement('p');
  var deleteBtn = document.createElement('button');
  var clearFix = document.createElement('div'); // for background color and correct position
  entryValue.textContent = eValue;
  deleteBtn.textContent = 'Delete';
  deleteBtn.innerHTML = '<img src="/icons/trash.png"/>';
  entryValue.setAttribute('style','margin-left: 45px');
  deleteBtn.setAttribute('title','Delete');
  deleteBtn.setAttribute('class','floatLeft button');
  deleteBtn.setAttribute('style','margin: 0% auto');
  clearFix.setAttribute('class','clearfix');
  entryDisplay.appendChild(deleteBtn);
  entryDisplay.appendChild(entryValue);
  entryDisplay.appendChild(clearFix);
  entry.appendChild(entryDisplay);
  
  // set up listener for the delete functionality
  deleteBtn.addEventListener('click',(e) => {
    const evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
    browser.storage.local.remove(eKey);
    deleteUrl(eKey);
    sendInfoAndValue('urls', urls);
  })

  // edit box
  var entryEdit = document.createElement('div');
  var entryEditInput = document.createElement('input');
  var clearFix2 = document.createElement('div');
  var updateBtn = document.createElement('button');
  var cancelBtn = document.createElement('button');
  entryEditInput.setAttribute('class','input');
  entryEditInput.setAttribute('style','width:70%');
  updateBtn.innerHTML = '<img src="/icons/ok.png"/>';
  updateBtn.setAttribute('title','Update');
  updateBtn.setAttribute('class','button');
  updateBtn.setAttribute('style','margin: 0% auto');
  cancelBtn.innerHTML = '<img src="/icons/cancel.png"/>';
  cancelBtn.setAttribute('title','Cancel update');
  cancelBtn.setAttribute('class','button');
  cancelBtn.setAttribute('class','floatRight button');
  cancelBtn.setAttribute('style','margin: 0% auto');
  clearFix2.setAttribute('class','clearfix');
  entryEdit.appendChild(entryEditInput);
  entryEdit.appendChild(updateBtn);
  entryEdit.appendChild(cancelBtn);
  entryEdit.appendChild(clearFix2);
  entry.appendChild(entryEdit);
  entryEditInput.value = eValue;
  entryEdit.style.display = 'none';

  infoContainer.appendChild(entry);

  // set up listeners for the update functionality
  entryValue.addEventListener('click',() => {
    entryDisplay.style.display = 'none';
    entryEdit.style.display = 'block';
  })

  cancelBtn.addEventListener('click',() => {
    entryDisplay.style.display = 'block';
    entryEdit.style.display = 'none';
    entryEditInput.value = eValue;
  })

  updateBtn.addEventListener('click',() => {
    if(entryEditInput.value !== eValue) { // type a different value
      info2save = entryEditInput.value;
      var id2save = eKey.split('_')[0] + '_' + info2save;
      var gettingItem = browser.storage.local.get(id2save);
      gettingItem.then((result) => { // result: empty object if the searched value is not stored
        var searchInStorage = Object.keys(result); // array with the searched value if it is stored
        if(searchInStorage.length < 1) { // searchInStorage.length < 1 -> no stored
          updateEntry(eKey, id2save);
          entry.parentNode.removeChild(entry);
        }
      });
    } 
  });

  // update
  function updateEntry(id2change, id2save) {
    addUrl(id2save);
    var storingInfo = browser.storage.local.set({ [id2save] : info2save });
    storingInfo.then(() => {
      deleteUrl(id2change);
      var removingEntry = browser.storage.local.remove(id2change);
      removingEntry.then(() => {
        showStoredInfo(id2save,info2save);
      }, reportError);
    }, reportError);
    sendInfoAndValue('urls', urls);
  }
}

function getIdHtmlOfClickedButtonOrImageFromEventClick(eventClick){
  return eventClick.target.id || eventClick.target.parentElement.id;
}

function hideInfo(){
  document.querySelector('#'+idElement2Change).classList.add('hidden');
}

function showTagsInfo(){
  document.querySelector('#'+idElement2Change).classList.remove('hidden');
}

function sendInfo(tabs) {
  browser.tabs.sendMessage(tabs[0].id, {
    info: info2sendFromPopup,
    values: values2sendFromPopup
  });
}

function showOrHideInfo(){
  if (document.getElementById(idElement2Change).classList.contains('hidden')){
    showTagsInfo();
  } else {
    hideInfo();
  }
}

function showStoredUrlsType(type2show){
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    var keys = Object.keys(results);
    keys.forEach(function(arrayValue){
      if (arrayValue.includes(type2show)){
        showStoredInfo(arrayValue, results[arrayValue]);
      }
    });
  }, reportError);
}

function sendInfoAndValue(info2send, value2send){
  info2sendFromPopup = info2send;
  values2sendFromPopup = value2send;
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendInfo)
    .catch(reportError); 
}

function sendInfoSaveAndShowAnswer(tabs) {
  tabs.forEach(function(arrayValues){
    browser.tabs.sendMessage(
      arrayValues.id,
      {info: info2sendFromPopup}
    ).then(response => {
      changeParagraph(response.response);
    }).catch(reportError);
  });
}

function changeParagraph(response) {
  if (typeof response !== 'undefined'){ // check if the content-script response has been received
    if (info2sendFromPopup === 'buttonScroll') {
      document.getElementById(idElement2Change).textContent = response;
    } else if (info2sendFromPopup === 'buttonShowSources') {
      cleanShowSources();
      for (sourceTag in response) {
        listSourceTagSummary(sourceTag, response[sourceTag]);
      }
    }
  } else {
    document.getElementById(idElement2Change).textContent = 'No info received from the content script.';
  }
}

function enableElements(idElements2Change){
  idElements2Change.forEach(function(arrayValue){
    document.getElementById(arrayValue).disabled = false;
  });
}
	
function listSourceTagSummary(tag, sourceTagSummary) {

  showSummaryText(sourceTagSummary.sourcesAllNumber, tag, getExtraText());
  listSources();

  function getExtraText() {
    return (sourceTagSummary.sourcesAllNumber === 0) ? '' : (sourceTagSummary.sourcesValid.length === 0) ? 'Without not blacklisted sources.' : 'Sources (not blacklisted):';
  }

  function showSummaryText(numberOfElements, tag, text) {
    let entry = document.createElement('p');
    let extraText = document.createElement('p');
    let underlined = document.createElement('u');
    let bold = document.createElement('b');
    const underlined_text = (numberOfElements === 1) ? 'element' : 'elements';
    bold.textContent = tag;
    extraText.textContent = text;
    underlined.textContent = `${numberOfElements} ${underlined_text} with tag `;
    underlined.appendChild(bold);
    entry.appendChild(underlined);
    entry.appendChild(extraText);
    sourcesContainer.appendChild(entry);
  }

  function listSources(){
    for (index = 0; index < sourceTagSummary.sourcesValid.length; index++){
      listNewSource(index + 1, sourceTagSummary.sourcesValid[index]);
    }
  }

  function listNewSource(index, url){
    var entry = document.createElement('div');
    var hyperlink = document.createElement('a');
    var info = document.createElement('p');
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

function removeShownStoredUrls(){
  while (infoContainer.firstChild) {
    infoContainer.removeChild(infoContainer.firstChild);
  }	  
}

function saveShowLogs(){
  if (document.getElementById('buttonShowLogs').checked == true){
    showLogs = 1;
  } else {
    showLogs = 0;
  }
  var storingInfo = browser.storage.local.set({['idShowLogs']:showLogs});
  storingInfo.then(() => {
  });
}

function deleteUrl(eKey){
  urls.forEach(function(arrayValue){
    if ( arrayValue.type == urlType ) {
      arrayValue.values = arrayValue.values.filter( value => value != eKey.replace(urlType+'_','') );
    }
  });
}

function addUrl(eKey){
  urls.forEach(function(arrayValue){
    if (arrayValue.type == urlType) {
      arrayValue.values.push(eKey.replace(urlType+'_',''));
    }
  });
}

// save input box info
function saveUrl(enterKey){
  info2save = document.querySelector('div.backGroundGrey textarea[id="inputUrl"]').value.split('\n');
  if (enterKey == 1){
    info2save.pop(); // delete last value (\n)
  }
  browser.tabs.query({active: true, currentWindow: true})
    .then(storeInfo)
    .catch(reportError)
}

// add a tag to the display, and storage
function storeInfo() {
  function saveInfo(id2save,value2save) {
    addUrl(id2save);
    sendInfoAndValue('urls', urls);
    var storingInfo = browser.storage.local.set({[id2save]:value2save});
    storingInfo.then(() => {
      showStoredInfo(id2save,value2save);
    }, reportError);
  }
  info2save = info2save.filter(function(value, position) { // delete duplicates
    return info2save.indexOf(value) == position;
  }) 
  info2save.forEach(function(arrayValue){
    var id2save = urlType + '_' + arrayValue;
    var gettingItem = browser.storage.local.get(id2save);
    gettingItem.then((result) => { // result: empty object if the searched value is not stored
      var searchInStorage = Object.keys(result); // array with the searched value if it is stored
      if(searchInStorage.length < 1) { // searchInStorage.length < 1 -> no stored;
        saveInfo(id2save,arrayValue);
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
  document.querySelector('#popup-content').classList.add('hidden');
  document.querySelector('#error-content').classList.remove('hidden');
  console.error(`Failed to check this web page: ${error.message}`);
}

// when the pop-up loads, inject a content script into the active tab,
// and add a click handler.
// if we couldn't inject the script, handle the error.
browser.tabs.executeScript({file: '/checkAndBorder.js'})
.then(popupMain)
.catch(reportExecuteScriptError);
