var idElement2Change;
var info2save; // string and array
var info2sendFromPopup;
var infoContainer = document.querySelector('.info-container');
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
  
  // delete url
  function deleteUrl(eKey){
    urls.forEach(function(arrayValue){
      if ( arrayValue.type == urlType ) {
        arrayValue.values = arrayValue.values.filter( value => value != eKey.replace(urlType+'_','') );
	  }
    });
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
  
  // clear from the display/storage
  function clearStorageInfo() {
    var gettingAllStorageItems = browser.storage.local.get(null);
    gettingAllStorageItems.then((results) => {
      deleteAllUrlType(results);
    }, reportError);
  }
  
  // add url
  function addUrl(eKey){
    urls.forEach(function(arrayValue){
      if (arrayValue.type == urlType) {
        arrayValue.values.push(eKey.replace(urlType+'_',''));
      }
    });
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

  // logs
  function getShowLogs(){
    var gettingItem = browser.storage.local.get('idShowLogs');
    gettingItem.then((result) => { // result: empty object if the searched value is not stored
      if (typeof result.idShowLogs != 'undefined'){ // show log option has never been used
        changeStateBoxLog(result);
      }
    }, reportError);
  }
  function saveShowLogs(){
    if (document.getElementById('boxLogs').checked == true){
      showLogs = 1;
    } else {
      showLogs = 0;
    }
    var storingInfo = browser.storage.local.set({['idShowLogs']:showLogs});
    storingInfo.then(() => {
    });
  }
  function reportError(error) {
    console.error(`Error: ${error}`);
  }
  // enable/disable logs
  function changeStateBoxLog(results){
    if(results.idShowLogs == 1) {
      document.getElementById('boxLogs').checked = true;
    } else {
      document.getElementById('boxLogs').checked = false;
	}
	sendInfoAndValue('showLogs',results.idShowLogs);
  }

  // display info
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

  // send info
  function sendInfo(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
      info: info2sendFromPopup,
      values: values2sendFromPopup
    });
  }
  function sendInfoAndValue(info2send, value2send){
    info2sendFromPopup = info2send;
    values2sendFromPopup = value2send;
    browser.tabs.query({active: true, currentWindow: true})
      .then(sendInfo)
      .catch(reportError); 
  }

  // listen to clicks on the buttons, and send the appropriate message to
  // the content script in the web page.
  document.addEventListener('click', (e) => {

    // send value, save and show the answer
    function sendInfoSaveAndShowAnswer(tabs) {
      var answer;
      function changeParagraph() {
        if (typeof answer != 'undefined'){ // check if the answer has been received
          document.getElementById(idElement2Change).innerHTML = String(answer);
        } else {
          document.getElementById(idElement2Change).innerHTML = 'No info received from the content script.';
        }
      }
      tabs.forEach(function(arrayValues){
        browser.tabs.sendMessage(
          arrayValues.id,
          {info: info2sendFromPopup}
        ).then(response => {
          answer = response.response;
          changeParagraph(answer);
        }).catch(reportError);
      });
    }

    // show or hide info
    function hideInfo(){
      document.querySelector('#'+idElement2Change).classList.add('hidden');
    }
    function showTagsInfo(){
      document.querySelector('#'+idElement2Change).classList.remove('hidden');
    }
    function showOrHideInfo(){
      if (document.getElementById(idElement2Change).classList.contains('hidden')){
        showTagsInfo();
      } else {
        hideInfo();
      }
    }
    function enableElements(idElements2Change){
      idElements2Change.forEach(function(arrayValue){
        document.getElementById(arrayValue).disabled = false;
      });
    }
    function notShowStoredUrls(){
      while (infoContainer.firstChild) {
        infoContainer.removeChild(infoContainer.firstChild);
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
	
    // get the active tab, then call the appropriate function
    if (e.target.classList.contains('recheck')){
      idElement2Change='infoTags';
      hideInfo();
      info2sendFromPopup = 'recheck';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendInfo)
        .catch(reportError);
    } else if (e.target.classList.contains('clean')) {
      idElement2Change = 'infoScroll';
      info2sendFromPopup = 'clean';
      hideInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendInfo)
        .catch(reportError);
    } else if (e.target.classList.contains('scroll')){
      idElement2Change = 'infoScroll';
      info2sendFromPopup = 'scroll';
      showTagsInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendInfoSaveAndShowAnswer)
        .catch(reportError);
    } else if (e.target.classList.contains('showSources')){
      idElement2Change='infoTags';
      info2sendFromPopup = 'showSources';
      showOrHideInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendInfoSaveAndShowAnswer)
        .catch(reportError);
    } else if (e.target.classList.contains('showConfig')){
      idElement2Change='menuConfig';
      showOrHideInfo();
    } else if (e.target.classList.contains('showLogs')){
      saveShowLogs();
      values2sendFromPopup = showLogs;
      info2sendFromPopup = 'showLogs';
      sendInfoAndValue(info2sendFromPopup,values2sendFromPopup);
    } else if (e.target.classList.contains('buttonUrlsNotify')){
      urlType = urlTypeNotify;
      notShowStoredUrls();
      showStoredUrlsType(urlType+'_');
      enableElementsConfiguration();
    } else if (e.target.classList.contains('buttonUrlsBlacklist')){
      urlType = urlTypeBlacklist;
      notShowStoredUrls();
      showStoredUrlsType(urlType+'_');
      enableElementsConfiguration();
    } else if (e.target.classList.contains('buttonUrlsReferer')){
      urlType = urlTypeReferer;
      notShowStoredUrls();
      showStoredUrlsType(urlType+'_');
      enableElementsConfiguration();
    } else if (e.target.classList.contains('addUrl')){
      saveUrl();
    } else if (e.target.classList.contains('clearAllInfo')){
      browser.tabs.query({active: true, currentWindow: true})
        .then(clearStorageInfo)
        .catch(reportError)
    }

    function enableElementsConfiguration(){
        enableElements(['pInput','inputUrl','buttonAdd','buttonClearAll']);
    }
  });


  // set up listener for the input box
  document.getElementById('inputUrl').addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) { // enter key
     saveUrl(1);
    }
  });

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
