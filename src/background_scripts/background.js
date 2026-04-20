const FrameDetectionState = {
  NONE: 0,
  FOUND: 1,
  SPECIAL_FOUND: 2,
};
const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];
let currentTab;
let currentTabId;
let frameDetectionState = FrameDetectionState.NONE;
let iconTitle;
let info2send = "";
let referers;
let protocolIsSupported = false;
let tabUrl;
let tabUrlElement;
let tabUrlProtocol;
let titleIcon;

function updateActiveTab() {
  var gettingActiveTab = browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  gettingActiveTab.then(updateTab);

  function updateTab(tabs) {
    currentTab = tabs[0];
    if (currentTab) {
      console.log("Init updateActiveTab");
      currentTabId = currentTab.id;
      getTabInfo();
      checkSupportedProtocol();
      if (protocolIsSupported) {
        info2send = "protocolok";
        sendAmessage();
      } else {
        updateTitle();
      }
    }
  }

  function getTabInfo() {
    tabUrlElement = document.createElement("a");
    tabUrlElement.href = currentTab.url; // add href value, necessary to get the protocol (e.g.: the protocol of the url 'about:debugging' is 'about:'
    tabUrl = currentTab.url;
    console.log(`Tab url: ${tabUrl}`);
    tabUrlProtocol = tabUrlElement.protocol;
  }

  function checkSupportedProtocol() {
    if (SUPPORTED_PROTOCOLS.indexOf(tabUrlProtocol) != -1) {
      protocolIsSupported = true;
    } else {
      protocolIsSupported = false;
    }
  }
}

// update browserAction icon to reflect if the current web page has any of the searched tags
function updateIcon(title) {
  console.log("Init updateIcon");
  if (title == "Web page with (i)frames") {
    change2iconOn();
  } else if (title == "Detected special (i)frames to notify") {
    change2iconOnInList();
  } else {
    change2iconOff();
  }
}

function change2iconOnInList() {
  browser.browserAction.setIcon({
    path: "icons/i_purple.png",
    tabId: currentTabId,
  });
}

function change2iconOn() {
  browser.browserAction.setIcon({
    path: "icons/i_orange.png",
    tabId: currentTabId,
  });
}

function change2iconOff() {
  browser.browserAction.setIcon({
    path: "icons/i_green.png",
    tabId: currentTabId,
  });
}

function changeTitle() {
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: titleIcon,
    tabId: currentTabId,
  });
}

// update addon title
function updateTitle() {
  if (!protocolIsSupported) {
    titleIcon = "This web page cannot be analyzed";
  } else if (frameDetectionState == FrameDetectionState.SPECIAL_FOUND) {
    titleIcon = "Detected special (i)frames to notify";
  } else if (frameDetectionState == FrameDetectionState.FOUND) {
    titleIcon = "Web page with (i)frames";
  } else if (frameDetectionState == FrameDetectionState.NONE) {
    titleIcon = "No (i)frames on the web page";
  }
  changeTitle();
}

// get icon's state of the current tab, looking tittle value, in order to actualize the icon correctly (avoid errors when select another tab)
// access promise value:
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browserAction/getTitle
function getIconTitleAndUpdateIcon() {
  iconTitle = browser.browserAction.getTitle({ tabId: currentTabId });
  iconTitle.then(updateIcon);
}

// get message from content script
function saveMessageAndUpdateTitle(message) {
  console.log("Message received from content-script:");
  console.log(message);
  referers = message.referers;
  frameDetectionState = message.tagsExist;  // TODO rename message.tagsExist to message.frameDetectionState
  if (protocolIsSupported) {
    var gettingActiveTab = browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    gettingActiveTab.then((tabs) => {
      tabUrl = tabs[0].url;
      console.log(`Current tab url: ${tabUrl}`);
      if (checkRunRedirect() && message.locationUrl !== false) {
        redirectTo(message.locationUrl);
      }
    });
  }
  updateTitle(); // used twice in this .js to avoid bad behaviour
  getIconTitleAndUpdateIcon();
}

function checkRunRedirect() {
  return referers.some(isStringInUrl);

  function isStringInUrl(element) {
    return tabUrl.toLowerCase().includes(element.toLowerCase());
  }
}

async function redirectTo(locationUrl) {
  console.log(`Init redirect to ${locationUrl}`);
  var updating = browser.tabs.update({ url: locationUrl });
  updating.then(onUpdated, console.error);
  // Avoid infinitive loops that are raised when a referer source
  // is added to the configuration and the source matches
  // the url of a tab.
  browser.windows.onFocusChanged.removeListener(handleUpdatedWindow);
  browser.tabs.onUpdated.removeListener(handleUpdatedTabUrl);
  browser.tabs.onActivated.removeListener(handleActivatedTab);
  await sleepMs(3000);
  browser.windows.onFocusChanged.addListener(handleUpdatedWindow);
  browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);
  browser.tabs.onActivated.addListener(handleActivatedTab);

  function onUpdated() {
    console.log("Updated tab");
  }
}

// send a message to the content script in the active tab.
function sendValue() {
  console.log("Init sendValue to tab id: " + currentTabId);
  browser.tabs
    .sendMessage(currentTabId, {
      command: "buttonRecheck",
      info: info2send,
    })
    .catch(console.error);
}

function reportError(error) {
  console.error(`Error: ${error}`);
}

function sendAmessage() {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(sendValue)
    .catch(reportError);
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
function handleUpdatedWindow(windowId) {
  // Avoid updateIcon twice when a tab is clicked or new url loaded in a new window.
  browser.tabs.onActivated.removeListener(handleActivatedTab);
  const notBrowserWindowId = -1;
  if (windowId != notBrowserWindowId) {
    console.log("Init newly focused window. Window id: " + windowId);
    updateActiveTab();
  }
  browser.tabs.onActivated.addListener(handleActivatedTab);
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
function handleUpdatedTabUrl(tabId, changeInfo) {
  if (changeInfo.status === "complete") {
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

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
console.log("Extension initialized");
updateActiveTab();

// assign 'saveMessageAndUpdateTitle()' as a listener to messages from the content script
browser.runtime.onMessage.addListener(saveMessageAndUpdateTitle);
