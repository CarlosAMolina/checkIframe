const DetectionState = {
  NONE: 0,
  FOUND: 1,
  SPECIAL_FOUND: 2,
};
const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];
let currentTabId;
let detectionState = DetectionState.NONE;
let info2send = "";
let tabUrlElement;

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
browser.runtime.onMessage.addListener((message, sender) => {
  console.log("Message received from content-script:");
  console.log(message);
  const tabUrl = sender.tab?.url;
  detectionState = message.detectionState;
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    console.log(`Current tab url: ${tabUrl}`);
    if (
      checkRunRedirect(message.referers, tabUrl) &&
      message.locationUrl !== false
    ) {
      redirectTo(message.locationUrl);
    }
  }
  updateAddonTitle(protocolIsSupported); // used twice in this .js to avoid bad behaviour
  getIconTitleAndUpdateIcon(currentTabId);
});

function isProtocolSupported(url) {
  const protocol = getProtocol(url);
  console.log(protocol);
  return SUPPORTED_PROTOCOLS.includes(protocol);
}

function getProtocol(url) {
  console.log(`Tab url: ${url}`);
  try {
    return new URL(url).protocol;
  } catch (error) {
    console.error(`Failed to parse URL "${url}":`, error);
    return "";
  }
}

function checkRunRedirect(referers, url) {
  return referers.some((element) =>
    url.toLowerCase().includes(element.toLowerCase()),
  );
}

async function redirectTo(locationUrl) {
  console.log(`Init redirect to ${locationUrl}`);
  const updating = browser.tabs.update({ url: locationUrl });
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

async function updateActiveTab() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];
    if (!activeTab) {
      return;
    }
    console.log("Init updateActiveTab");
    currentTabId = currentTab.id;
    const protocolIsSupported = isProtocolSupported(currentTab.url);
    if (protocolIsSupported) {
      info2send = "protocolok";
      sendAmessage();
    } else {
      updateAddonTitle(protocolIsSupported);
    }
  } catch (error) {
    reportError(error);
  }
}

async function getIconTitleAndUpdateIcon(tabId) {
  // get icon's state of the current tab, looking title value, in order to actualize the icon correctly (avoid errors when select another tab)
  const title = await browser.browserAction.getTitle({ tabId });
  updateIcon(tabId, title);
}

// update browserAction icon to reflect if the current web page has any of the searched tags
function updateIcon(tabId, title) {
  console.log("Init updateIcon");
  if (title == "Web page with (i)frames") {
    change2iconOn(tabId);
  } else if (title == "Detected special (i)frames to notify") {
    change2iconOnInList(tabId);
  } else {
    change2iconOff(tabId);
  }
}

function change2iconOnInList(tabId) {
  browser.browserAction.setIcon({
    path: "icons/i_purple.png",
    tabId: tabId,
  });
}

function change2iconOn(tabId) {
  browser.browserAction.setIcon({
    path: "icons/i_orange.png",
    tabId: tabId,
  });
}

function change2iconOff(tabId) {
  browser.browserAction.setIcon({
    path: "icons/i_green.png",
    tabId: tabId,
  });
}

function updateAddonTitle(protocolIsSupported) {
  let titleIcon;
  if (!protocolIsSupported) {
    titleIcon = "This web page cannot be analyzed";
  } else if (detectionState == DetectionState.SPECIAL_FOUND) {
    titleIcon = "Detected special (i)frames to notify";
  } else if (detectionState == DetectionState.FOUND) {
    titleIcon = "Web page with (i)frames";
  } else if (detectionState == DetectionState.NONE) {
    titleIcon = "No (i)frames on the web page";
  }
  changeTitle(currentTabId, titleIcon);
}

function changeTitle(tabId, titleIcon) {
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: titleIcon,
    tabId: tabId,
  });
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
