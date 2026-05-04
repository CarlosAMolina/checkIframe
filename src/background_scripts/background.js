const DetectionState = {
  NONE: 0,
  FOUND: 1,
  SPECIAL_FOUND: 2,
};
const NO_BROWSER_WINDOW_ID = -1;
const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];
const lastProcessedByTab = new Map();

// listen to click the button
// it is not necessary, use the popup button to recheck
//browser.browserAction.onClicked.addListener(updateActiveTab);

// listen to window switching
browser.windows.onFocusChanged.addListener(handleUpdatedWindow);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);

// listen to tab switching
browser.tabs.onActivated.addListener(handleActivatedTab);

browser.tabs.onRemoved.addListener((tabId) => {
  lastProcessedByTab.delete(tabId);
});

// update when the extension loads initially
console.log("Extension initialized");
updateActiveTab();

// listen to messages from the content script
browser.runtime.onMessage.addListener((message, sender) => {
  console.log("Message received from content-script:");
  console.log(message);
  const tabUrl = sender.tab?.url;
  const tabId = sender.tab?.id;
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
  updateAddonTitle(message.detectionState, protocolIsSupported, tabId); // used twice in this .js to avoid bad behaviour TODO check to avoid
  updateIcon(tabId);
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
  // Be careful with redirects to URLs that cause infinite loops. See test-manual/redirection-loop/
  console.log(`Init redirect to ${locationUrl}`);
  try {
    await browser.tabs.update({ url: locationUrl });
    console.log("Updated tab");
  } catch (error) {
    console.error(error);
  }
}

async function updateActiveTab() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (!activeTab) {
      return;
    }
    console.log("Init updateActiveTab");
    await updateTab(activeTab);
  } catch (error) {
    console.error(error);
  }
}

async function updateTab(tab) {
  // TODO check if this if can be dropped
  if (!tab || typeof tab.id !== "number") {
    return;
  }
  const tabId = tab.id;
  const tabUrl = tab.url || ""; // url can be temporaly stale (during navigation) // TODO check when tab.url is not an str
  // TODO fix, now the icon is not updated automatically
  if (wasAlreadyProcessed(tabId, tabUrl)) {
    // TODO check if this invalidates the recheck button
    console.log(`Skip duplicated update for tab ${tabId}`);
    return;
  }
  rememberProcessedTab(tabId, tabUrl);
  console.log(`Init update for tab id: ${tabId}`);
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    // send a message to the content script in the active tab.
    console.log("Init sendValue to tab id: " + tabId);
    browser.tabs
      .sendMessage(tabId, {
        command: "buttonRecheck",
        info: "protocolOk",
      })
      .catch(console.error);
  } else {
    updateAddonTitle(DetectionState.NONE, protocolIsSupported, tabId);
    updateIcon(tabId); // TODO maybe tis can be deleted
  }
}

function wasAlreadyProcessed(tabId, tabUrl) {
  return lastProcessedByTab.get(tabId) === tabUrl;
}

function rememberProcessedTab(tabId, tabUrl) {
  lastProcessedByTab.set(tabId, tabUrl);
}

// update browserAction icon to reflect if the current web page has any of the searched tags
async function updateIcon(tabId) {
  console.log("Init updateIcon");
  // get icon's state of the current tab, looking title value, in order to actualize the icon correctly (avoid errors when select another tab)
  const title = await browser.browserAction.getTitle({ tabId });
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

function updateAddonTitle(detectionState, protocolIsSupported, tabId) {
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
  changeTitle(tabId, titleIcon);
}

function changeTitle(tabId, titleIcon) {
  browser.browserAction.setTitle({
    // screen readers can see the title
    title: titleIcon,
    tabId: tabId,
  });
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
function handleUpdatedWindow(windowId) {
  // Example: a tab is clicked or new url loaded in a new window.
  if (windowId === NO_BROWSER_WINDOW_ID) {
    return;
  }
  console.log("Init newly focused window. Window id: " + windowId);
  updateActiveTab();
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
// TODO check tab is received when this function is called
function handleUpdatedTabUrl(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete") {
    return;
  }
  console.log("Init newly tab url loaded. Tab id: " + tabId);
  updateTab(tab); // TODO check if it should be replaced with updateActiveTab()
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/onActivated
async function handleActivatedTab(activeInfo) {
  // Example: a tab is moved to a new window.
  console.log("Init newly active tab. Tab id: " + activeInfo.tabId);
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    await updateTab(tab);
  } catch (error) {
    console.error(error);
  }
}

// TODO: ask gpt to simplify the whole flow into a cleaner event-driven design
