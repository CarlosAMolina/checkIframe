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


const urlsReferer = ['github.com', 'youtube.com']; // TODO use stored values.
var flagOnlyOneRun = false; //TODO delete

function redirectTo(urlLocation) {

  // Avoid infinite loops that sometimes are raised.
  browser.windows.onFocusChanged.removeListener(handleUpdatedWindow);
  browser.tabs.onUpdated.removeListener(handleUpdatedTabUrl);
  browser.tabs.onActivated.removeListener(handleActivatedTab);
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    tabUrl = tabs[0].url;
    console.log(`Current tab url: ${tabUrl}`);
    console.log('Init redirecting');
    browser.tabs.update({url: urlLocation});
    browser.windows.onFocusChanged.addListener(handleUpdatedWindow);
    browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);
    browser.tabs.onActivated.addListener(handleActivatedTab);
  });
};


function updateActiveTab() {

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);

  function updateTab(tabs) {
    currentTab = tabs[0];
    if (currentTab) {
      console.log('Init updateActiveTab');
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

  function getTabInfo(){
    tabUrlElement = document.createElement('a');
    tabUrlElement.href = currentTab.url; // add href value, necessary to get the protocol (e.g.: the protocol of the url 'about:debugging' is 'about:'
    tabUrl = currentTab.url;
    console.log('Tab url: ' + tabUrl);
    tabUrlProtocol = tabUrlElement.protocol;
  }

  function checkSupportedProtocol() {
    if (supportedProtocols.indexOf(tabUrlProtocol) != -1){
      supportedProtocol = 1;
    } else {
      supportedProtocol = 0;
    }
  }
  
}

// update browserAction icon to reflect if the current web page has any of the searched tags
function updateIcon(title) {
  console.log('Init updateIcon');
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
  console.log('Message received from content-script'); // TODO
  console.log(message); // TODO
  runRedirect = message.runRedirect;
  if (supportedProtocol == 1){
    if (runRedirect) {
      if (!flagOnlyOneRun) { // TODO delete
        redirectTo('https://duckduckgo.com');
        flagOnlyOneRun = true;
      }
    }
  // TODO   tagsExist = message.value;
  }
  // TODO updateTitle(); // used twice in this .js to avoid bad behaviour
  // TODO getIconTitleAndUpdateIcon();
}

// send a message to the content script in the active tab.
function sendValue(tabs) {
  console.log('Init sendValue to tab id: ' + currentTabId);
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


// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
function handleUpdatedWindow(windowId) {
  // Avoid updateIcon twice when a tab is clicked or new url loaded in a new window.
  browser.tabs.onActivated.removeListener(handleActivatedTab);
  notBrowserWindowId = -1
  if (windowId != notBrowserWindowId) {
    console.log("Init newly focused window. Window id: " + windowId);
    updateActiveTab();
  }
  browser.tabs.onActivated.addListener(handleActivatedTab);
}


//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
function handleUpdatedTabUrl(tabId, changeInfo) {
  if (changeInfo.status === 'complete') {
    console.log("Init newly tab url loaded. Tab id: " + tabId);
    updateActiveTab();
  }
}


// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/onActivated
function handleActivatedTab(activeInfo) {
  // Avoid updateIcon twice when a tab is moved to a new window.
  browser.tabs.onActivated.removeListener(handleActivatedTab);
  console.log("Init newly active tab. Tab id: " + activeInfo.tabId);
  updateActiveTab();
  browser.tabs.onActivated.addListener(handleActivatedTab);
}


// main

// listen to click the button
// it is not necessary, use the popup button to recheck
//browser.browserAction.onClicked.addListener(updateActiveTab);

// listen to window switching
browser.windows.onFocusChanged.addListener(handleUpdatedWindow);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);

// listen to tab switching
browser.tabs.onActivated.addListener(handleActivatedTab);

// update when the extension loads initially
console.log('Extension initialized');
updateActiveTab();

// assign 'saveMessageAndUpdateTittle()' as a listener to messages from the content script
browser.runtime.onMessage.addListener(saveMessageAndUpdateTittle);
