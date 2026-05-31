const NO_BROWSER_WINDOW_ID = -1;
const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];
const tabState = new Map();

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
  tabState.delete(tabId);
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
      message.locationUrl !== null
    ) {
      redirectTo(message.locationUrl);
    }
  }
  const appearanceKey = appearanceKeyFromDetection(
    message.detectionState,
    protocolIsSupported,
  );
  saveTabAppearance(tabId, appearanceKey);
  applyTabAppearance(tabId, appearanceKey);
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
  const tabId = tab.id;
  const tabUrl = tab.url || ""; // url can be temporaly stale (during navigation)
  if (wasAlreadyProcessed(tabId, tabUrl)) {
    console.log(`Skip duplicated update for tab ${tabId}`);
    refreshTabIcon(tabId);
    return;
  }
  rememberProcessedTab(tabId, tabUrl);
  console.log(`Init update for tab id: ${tabId}`);
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    // send a message to the content script in the active tab.
    console.log(`Init sendValue to tab id: ${tabId}`);
    browser.tabs
      .sendMessage(tabId, {
        command: "buttonRecheck",
        info: "protocolOk",
      })
      .catch(console.error);
  } else {
    const appearanceKey = appearanceKeyFromDetection(
      DetectionState.NONE,
      protocolIsSupported,
    );
    saveTabAppearance(tabId, appearanceKey);
    applyTabAppearance(tabId, appearanceKey);
  }
}

function wasAlreadyProcessed(tabId, tabUrl) {
  const state = tabState.get(tabId);
  return state !== undefined && state.url === tabUrl;
}

function rememberProcessedTab(tabId, tabUrl) {
  const existing = tabState.get(tabId);
  tabState.set(tabId, {
    url: tabUrl,
    appearanceKey: existing?.appearanceKey || "none",
  });
}

function saveTabAppearance(tabId, appearanceKey) {
  const existing = tabState.get(tabId);
  tabState.set(tabId, {
    url: existing?.url || "",
    appearanceKey: appearanceKey,
  });
}

function refreshTabIcon(tabId) {
  const state = tabState.get(tabId);
  const key = state?.appearanceKey || "none";
  applyTabAppearance(tabId, key);
}

const TAB_APPEARANCE = {
  unsupported: {
    title: "This web page cannot be analyzed",
    icon: "icons/i_gray.png",
  },
  specialFound: {
    title: "Detected special (i)frames to notify",
    icon: "icons/i_purple.png",
  },
  found: { title: "Web page with (i)frames", icon: "icons/i_orange.png" },
  none: { title: "No (i)frames on the web page", icon: "icons/i_green.png" },
};

function appearanceKeyFromDetection(detectionState, protocolIsSupported) {
  if (!protocolIsSupported) {
    return "unsupported";
  }
  if (detectionState === DetectionState.SPECIAL_FOUND) {
    return "specialFound";
  }
  if (detectionState === DetectionState.FOUND) {
    return "found";
  }
  return "none";
}

function applyTabAppearance(tabId, appearanceKey) {
  const appearance = TAB_APPEARANCE[appearanceKey];
  browser.browserAction.setTitle({ title: appearance.title, tabId });
  browser.browserAction.setIcon({ path: appearance.icon, tabId });
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
function handleUpdatedWindow(windowId) {
  // Example: a tab is clicked or new url loaded in a new window.
  if (windowId === NO_BROWSER_WINDOW_ID) {
    return;
  }
  console.log(`Init newly focused window. Window id: ${windowId}`);
  updateActiveTab();
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
function handleUpdatedTabUrl(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete") {
    return;
  }
  console.log(`Init newly tab url loaded. Tab id: ${tabId}`);
  updateTab(tab);
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/onActivated
async function handleActivatedTab(activeInfo) {
  // Example: a tab is moved to a new window.
  console.log(`Init newly active tab. Tab id: ${activeInfo.tabId}`);
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    await updateTab(tab);
  } catch (error) {
    console.error(error);
  }
}
