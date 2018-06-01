var currentTab;
var currentTabId;
var iconTitle;
var tagsExist;
var info2send = '';
var supportedProtocol;
var supportedProtocols = ['https:', 'http:', 'file:'];
var tabUrl;
var tabUrlElement
var tabUrlProtocol;
var titleIcon;

function updateActiveTab(tabs) {

  function getTabInfo(){
    tabUrlElement = document.createElement('a');
    tabUrlElement.href = currentTab.url; // add href value, necessary to get the protocol (e.g.: the protocol of the url 'about:debugging' is 'about:'
    tabUrl = currentTab.url;
    tabUrlProtocol = tabUrlElement.protocol;
  }

  function checkSupportedProtocol() {
    if (supportedProtocols.indexOf(tabUrlProtocol) != -1){
      supportedProtocol = 1;
    } else {
      supportedProtocol = 0;
    }
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      currentTabId = currentTab.id;
      getTabInfo();
      checkSupportedProtocol();
      if (supportedProtocol == 1){
        info2send = 'protocolok';
        sendAmessage();
      } else {
        updateTitle();  
      }
    }
  }
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

// update browserAction icon to reflect if the current web page has any of the searched tags
function updateIcon(title) {
  if (title == 'resultsYES'){
    change2iconOn();
  } else if (title == 'resultsYESsourceInList'){
    change2iconOnInList();
  } else {
    change2iconOff();
  }
}

function change2iconOnInList(){
  browser.browserAction.setIcon({
    path: 'icons/i_purple.png',
    tabId: currentTabId
  });
}

function change2iconOn(){
  browser.browserAction.setIcon({
    path: 'icons/i_orange.png',
    tabId: currentTabId
  });
}

function change2iconOff(){
  browser.browserAction.setIcon({
    path: 'icons/i_green.png',
    tabId: currentTabId
  });
}

function changeTitle(){
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: titleIcon,
    tabId: currentTabId
  });
}

// update addon title
function updateTitle() {
  if (supportedProtocol == 0){
    titleIcon = 'notSupportedWebPage'
  } else if (tagsExist == 2){
    titleIcon = 'resultsYESsourceInList';
  } else if (tagsExist == 1){
    titleIcon = 'resultsYES';
  } else if (tagsExist == 0){
    titleIcon = 'resultsNO';
  }
  changeTitle();
}

// get icon's state of the current tab, looking tittle value, in order to actualize the icon correctly (avoid errors when select another tab)
// access promise value:
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browserAction/getTitle
function getIconTitleAndUpdateIcon(){
  iconTitle = browser.browserAction.getTitle({tabId: currentTabId});
  iconTitle.then(updateIcon);
}

// get message from content script
function saveMessageAndUpdateTittle(message) {
  if (supportedProtocol == 1){
    tagsExist = message.value;
  }
  updateTitle(); // used twice in this .js to avoid bad behaviour
  getIconTitleAndUpdateIcon();
}

// send a message to the content script in the active tab.
function sendValue(tabs) {
  browser.tabs.sendMessage(currentTabId, {
    command: 'recheck',
    info: info2send
  });
}

function reportError(error) {
  console.error(`Error: ${error}`);
}

function sendAmessage(){
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendValue)
    .catch(reportError);
}

// main

// listen to click the button
// it is not necessary, use the popup button to recheck
//browser.browserAction.onClicked.addListener(updateActiveTab);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();

// assign 'saveMessageAndUpdateTittle()' as a listener to messages from the content script
browser.runtime.onMessage.addListener(saveMessageAndUpdateTittle);