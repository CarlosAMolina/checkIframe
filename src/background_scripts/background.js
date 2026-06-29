import "../browser-polyfill.js";

import { log } from "../logger.js";
import { logError } from "../logger.js";
import { isProtocolSupported } from "../supported-protocols.js";

const NO_BROWSER_WINDOW_ID = -1;

// listen to click the button
// it is not necessary, use the popup button to recheck
//browser.action.onClicked.addListener(updateActiveTab);

// Listen to window switching (not supported on Firefox for Android).
// This `if` guard prevents the background script from crashing on Firefox for Android
// where browser.windows is unsupported.
// Android doesn't lose functionailty because it doesn't have multiple browser windows,
// Firefox for Android is a single-window browser, so windows.onFocusChanged
// would never fire meaningfully anyway.
// Once the crash is avoided,
// the tabs.onUpdated, tabs.onActivated, and runtime.onMessage listeners
// register normally, and the contentScriptReady ->protocolOk flow works as
// expected for automatic detection.
if (browser.windows?.onFocusChanged) {
  browser.windows.onFocusChanged.addListener(handleUpdatedWindow);
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleUpdatedTabUrl);

// listen to tab switching
browser.tabs.onActivated.addListener(handleActivatedTab);

// update when the extension loads initially
log("Extension initialized");
updateActiveTab();

// listen to messages from the content script
browser.runtime.onMessage.addListener(handleContentScriptMessage);

async function handleContentScriptMessage(message, sender) {
  log("Message received from content-script:");
  log(message);
  const tabUrl = sender.tab?.url;
  const tabId = sender.tab?.id;
  // Fix race condition on tab duplication using content script ready signal.
  // Instead of sending protocolOk immediately on tabs.onUpdated complete
  // (which races with the content script's async init), the content script
  // sends contentScriptReady after its message listener is registered.
  // The background responds with protocolOk, guaranteeing the listener exists.
  // This fixes this error on tab duplication: `Error: Could not establish connection. Receiving
  // end does not exist. updateTab moz-extension://.../background_scripts/background.js`.
  // and allows reload detection to work correctly since handleUpdatedTabUrl
  // no longer needs to trigger detection for supported protocols.
  if (message.info === "contentScriptReady") {
    const protocolIsSupported = isProtocolSupported(tabUrl);
    if (protocolIsSupported && (await isAutomaticDetectionEnabled())) {
      browser.tabs.sendMessage(tabId, {
        info: "protocolOk",
      });
    } else if (protocolIsSupported) {
      applyTabAppearance(tabId, "disabled");
    }
    return;
  }
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    log(`Current tab url: ${tabUrl}`);
    const { referer: referers } = await browser.storage.local.get({
      referer: [],
    });
    if (checkRunRedirect(referers, tabUrl) && message.locationUrl !== null) {
      if (message.locationUrl === tabUrl) {
        log("Omitting redirection to avoid infinitive loops");
      } else {
        redirectTo(tabId, message.locationUrl);
      }
    }
  }
  const appearanceKey = appearanceKeyFromDetection(
    message.detectionState,
    protocolIsSupported,
  );
  applyTabAppearance(tabId, appearanceKey);
}

function checkRunRedirect(referers, url) {
  return referers.some((element) =>
    url.toLowerCase().includes(element.toLowerCase()),
  );
}

async function redirectTo(tabId, locationUrl) {
  log(`Init redirect to ${locationUrl}`);
  try {
    await browser.tabs.update(tabId, { url: locationUrl });
    log("Updated tab");
  } catch (error) {
    logError(error);
  }
}

async function isAutomaticDetectionEnabled() {
  const { idAutomaticDetection } = await browser.storage.local.get({
    idAutomaticDetection: true,
  });
  return idAutomaticDetection;
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
    log("Init updateActiveTab");
    await updateTab(activeTab);
  } catch (error) {
    logError(error);
  }
}

async function updateTab(tab) {
  // Avoid `Error. Could not establish connection. Receiving end does not exist.`.
  // No state is lost, this script has contentScriptReady and protocolOk messages.
  if (tab.status === "loading") {
    return;
  }
  const tabId = tab.id;
  const tabUrl = tab.url || ""; // url can be temporarily stale (during navigation)
  log(`Init update for tab id: ${tabId}`);
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (protocolIsSupported) {
    if (await isAutomaticDetectionEnabled()) {
      log(`Init sendMessage to the content script in tab id: ${tabId}`);
      browser.tabs
        .sendMessage(tabId, {
          info: "protocolOk",
        })
        .catch(logError);
    } else {
      applyTabAppearance(tabId, "disabled");
    }
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
    icon: "icons/i_gray_32.png",
  },
  disabled: {
    title: "Automatic detection is off",
    icon: "icons/i_blue_32.png",
  },
  specialFound: {
    title: "Detected special (i)frames to notify",
    icon: "icons/i_purple_32.png",
  },
  found: { title: "Web page with (i)frames", icon: "icons/i_orange_32.png" },
  none: { title: "No (i)frames on the web page", icon: "icons/i_green_32.png" },
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
  browser.action.setIcon({
    path: browser.runtime.getURL(appearance.icon),
    tabId,
  });
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
function handleUpdatedWindow(windowId) {
  // Example: a tab is clicked or new url loaded in a new window.
  if (windowId === NO_BROWSER_WINDOW_ID) {
    return;
  }
  log(`Init newly focused window. Window id: ${windowId}`);
  updateActiveTab();
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
function handleUpdatedTabUrl(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete") {
    return;
  }
  log(`Init newly tab url loaded. Tab id: ${tabId}`);
  const tabUrl = tab.url || "";
  const protocolIsSupported = isProtocolSupported(tabUrl);
  if (!protocolIsSupported) {
    const appearanceKey = appearanceKeyFromDetection(
      "none",
      protocolIsSupported,
    );
    applyTabAppearance(tabId, appearanceKey);
  }
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/onActivated
async function handleActivatedTab(activeInfo) {
  // Example: a tab is moved to a new window.
  log(`Init newly active tab. Tab id: ${activeInfo.tabId}`);
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    await updateTab(tab);
  } catch (error) {
    logError(error);
  }
}

export const _forTesting = {
  updateActiveTab,
  updateTab,
  applyTabAppearance,
  appearanceKeyFromDetection,
  checkRunRedirect,
  isAutomaticDetectionEnabled,
  redirectTo,
  handleUpdatedWindow,
  handleUpdatedTabUrl,
  handleActivatedTab,
  handleContentScriptMessage,
};
