const NO_BROWSER_WINDOW_ID = -1;
const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];

// listen to click the button
// it is not necessary, use the popup button to recheck
//browser.action.onClicked.addListener(updateActiveTab);

// listen to window switching
browser.windows.onFocusChanged.addListener(handleUpdatedWindow);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);

// listen to tab switching
browser.tabs.onActivated.addListener(handleActivatedTab);

// update when the extension loads initially
console.log("Extension initialized");
updateActiveTab();

// listen to messages from the content script
browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log("Message received from content-script:");
  console.log(message);
  const tabUrl = sender.tab?.url;
  const tabId = sender.tab?.id;
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    console.log(`Current tab url: ${tabUrl}`);
    const { referer: referers } = await browser.storage.local.get({
      referer: [],
    });
    if (
      checkRunRedirect(referers, tabUrl) &&
      message.locationUrl !== null &&
      message.locationUrl !== tabUrl
    ) {
      redirectTo(tabId, message.locationUrl);
    }
  }
  const appearanceKey = appearanceKeyFromDetection(
    message.detectionState,
    protocolIsSupported,
  );
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

async function redirectTo(tabId, locationUrl) {
  // Be careful with redirects to URLs that cause infinite loops. See test-manual/redirection-loop/
  console.log(`Init redirect to ${locationUrl}`);
  try {
    await browser.tabs.update(tabId, { url: locationUrl });
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
  const tabUrl = tab.url || ""; // url can be temporarily stale (during navigation)
  console.log(`Init update for tab id: ${tabId}`);
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    // Send a message to the content script in the active tab.
    console.log(`Init sendValue to tab id: ${tabId}`);
    browser.tabs
      .sendMessage(tabId, {
        info: "protocolOk",
      })
      .catch(console.error);
  } else {
    const appearanceKey = appearanceKeyFromDetection(
      "none",
      protocolIsSupported,
    );
    applyTabAppearance(tabId, appearanceKey);
  }
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
  return detectionState;
}

function applyTabAppearance(tabId, appearanceKey) {
  const appearance = TAB_APPEARANCE[appearanceKey];
  browser.action.setTitle({ title: appearance.title, tabId });
  browser.action.setIcon({ path: appearance.icon, tabId });
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
