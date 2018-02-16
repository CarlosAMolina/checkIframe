var iframeExistsBackground;
var tittleDefault = 'CheckIframe';
var tittleIframeYES = 'iframeYES';
var tittleIframeNO = 'iframeNO';
var iconTitle;
var currentTab;
var currentTabId;
var tabUrlElement
var tabUrl;
var tabUrlProtocol;
var supportedProtocol;
var supportedProtocols = ["https:", "http:"];

function updateActiveTab(tabs) {

  function getTabInfo(){
    tabUrlElement = document.createElement('a');
    tabUrlElement.href = currentTab.url; // add href value, neccesary to get protocol (ie: about:debugging -> protocol is about: (you know what I mean))
    tabUrl = currentTab.url;
    tabUrlProtocol = tabUrlElement.protocol;
  }

  function checkSupportedProtocol() {
    if (supportedProtocols.indexOf(tabUrlProtocol) != -1){
      console.log("background) url and protocol: correct");
      supportedProtocol = 1;
    } else {
      console.log('This addon does not support the URL:', tabUrl);
      supportedProtocol = 0;
    }
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      currentTabId = currentTab.id;
      console.log("current tab id: ", currentTabId);
      getTabInfo();
      checkSupportedProtocol();
      if (supportedProtocol == 1){
        sendAmessage();
      }
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

//update the browserAction icon to reflect if the current page has an iframe
function updateIcon(title) {
  if (title == tittleIframeYES){
    change2iconOn();
  } else {
    change2iconOff();
  }
}

function change2iconOn(){
  browser.browserAction.setIcon({
    path: {
      19: "icons/star-filled-19.png",
      38: "icons/star-filled-38.png"
    },
    tabId: currentTabId
  });
  console.log("background) icon updated: on");
}

function change2iconOff(){
  browser.browserAction.setIcon({
    path: {
      19: "icons/star-empty-19.png",
      38: "icons/star-empty-38.png"
    },
    tabId: currentTabId
  });
  console.log("background) icon updated: off");
}

function change2titleOff(){
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: tittleIframeNO,
    tabId: currentTabId
  });	
  console.log("background) title updated: off");
}

function change2titleOn(){
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: tittleIframeYES,
    tabId: currentTabId
  });
  console.log("background) title updated: on");
}

// update addon title
function updateTitle() {
  if (iframeExistsBackground == 1){
    change2titleOn();   
  }
  else if (iframeExistsBackground == 0){
    change2titleOff();
  }
}

// get icon state of the current tab, looking tittle value, in order to actualice the icon correctly (avoid errors when select another tab)
// acess promise value:
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browserAction/getTitle
function getIconTitleAndUpdateIcon(){
  iconTitle = browser.browserAction.getTitle({tabId: currentTabId});
  console.log("background) save icon title");
  iconTitle.then(updateIcon);
}

// get message form content script
function saveMessageAndUpdateTittle(message) {
  if (supportedProtocol == 1){
    iframeExistsBackground = message.value;
    console.log("background) save message: ", iframeExistsBackground);
    updateTitle();
    getIconTitleAndUpdateIcon();
  }
}

// send a message to the content script in the active tab.
function sendValue(tabs) {
  browser.tabs.sendMessage(currentTabId, {
    command: "recheckIframe",
    info: "exampleText"
  });
  console.log("background) send message");
}

function reportError(error) {
  console.error(`Error: ${error}`);
  console.log("background) send message: error");
}

function sendAmessage(){
  browser.tabs.query({active: true, currentWindow: true})
    .then(sendValue)
    .catch(reportError);
}


// main

console.log("background) main");

// listen to click the button
browser.browserAction.onClicked.addListener(updateActiveTab);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();

// assign `saveMessageAndUpdateTittle()` as a listener to messages from the content script
browser.runtime.onMessage.addListener(saveMessageAndUpdateTittle);