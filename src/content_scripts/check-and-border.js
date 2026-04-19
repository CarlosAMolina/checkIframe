const HIGHLIGHT_CLASS = "check-iframe-detector-highlight";
const HIGHLIGHT_STYLE_ID = "check-iframe-detector-style";
const TAGS_STATUS = {
  NOT_FOUND: 0,
  FOUND: 1,
  NOTIFY_MATCH: 2,
};
// When the pop-up is closed, this info is lost
const state = {
  blacklistedSources: [],
  highlightAllAutomatically: false,
  indexToHighlight: 0,
  notifySources: [],
  refererSources: [],
  showLogs: false,
};

(async function () {
  // check and set a global guard variable.
  // if this content script is injected into the same web page again,
  // it will do nothing next time.
  // avoid saving pop-up messages twice
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  const handlers = {
    protocolok: handleProtocolOk,
    buttonRecheck: handleButtonRecheck,
    buttonScroll: handleButtonScroll,
    buttonClean: handleButtonClean,
    buttonShowSources: handleButtonShowSources,
    buttonShowLogs: handleButtonShowLogs,
    buttonHighlightAllAutomatically: handleButtonHighlightAllAutomatically,
    urls: handleSourcesUpdate,
  };
  await initializeGlobalVariables();
  setHighlightStyle();
  // Listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => {
    const handler = handlers[message.info];
    return handler(message);
  });
})();

async function initializeGlobalVariables() {
  state.blacklistedSources = [];
  state.notifySources = [];
  state.refererSources = [];
  try {
    const [{ idShowLogs, idHighlightAllAutomatically }, storageData] =
      await Promise.all([
        browser.storage.local.get({
          idShowLogs: false,
          idHighlightAllAutomatically: false,
        }),
        browser.storage.local.get(null),
      ]);
    state.showLogs = idShowLogs;
    state.highlightAllAutomatically = idHighlightAllAutomatically;
    for (const [key, value] of Object.entries(storageData)) {
      if (key.startsWith(URL_TYPE_BLACKLIST + "_")) {
        state.blacklistedSources.push(value);
      } else if (key.startsWith(URL_TYPE_NOTIFY + "_")) {
        state.notifySources.push(value);
      } else if (key.startsWith(URL_TYPE_REFERER + "_")) {
        state.refererSources.push(value);
      }
    }
  } catch (error) {
    reportErrorContentScript(error);
  }
}

// It is better to add/drop a custom css class, instead of modify an element property,
// to avoid lost current page css.
// !important: ensure the highlight is visible even when the page has its own border rules.
// outline: is even safer than border because it does not take space in layout.
function setHighlightStyle() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 10px solid red !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

async function handleProtocolOk() {
  const { elements } = analyzePageAndSend();
  try {
    // Required to highlight all when changing to a different tab already open.
    const { idHighlightAllAutomatically } = await browser.storage.local.get({
      idHighlightAllAutomatically: false,
    });
    state.highlightAllAutomatically = idHighlightAllAutomatically;
    highlightAllIfRequired(
      getNonBlacklistedElements(elements),
      state.highlightAllAutomatically,
    );
  } catch (error) {
    reportErrorContentScript(error);
  }
}

function handleButtonRecheck() {
  const { elements, analysis } = analyzePageAndSend();
  highlightAllIfRequired(
    getNonBlacklistedElements(elements),
    state.highlightAllAutomatically,
  );
  return Promise.resolve(analysis.sourcesSummary);
}

function handleButtonScroll() {
  const validElements = getValidPageElements();
  if (validElements.length === 0) {
    return Promise.resolve({ response: "No detections to show" });
  }
  // To control if the page or the blacklisted sources have changed
  if (state.indexToHighlight >= validElements.length) {
    state.indexToHighlight = 0;
  }
  const indexToUnhighlight =
    state.indexToHighlight === 0
      ? validElements.length - 1
      : state.indexToHighlight - 1;
  unhighlight(validElements[indexToUnhighlight]);
  scroll(validElements[state.indexToHighlight]);
  highlight(validElements[state.indexToHighlight]);
  const response = summaryOfTheHighlightedElement(
    validElements,
    state.indexToHighlight,
  );
  state.indexToHighlight =
    state.indexToHighlight === validElements.length - 1
      ? 0
      : state.indexToHighlight + 1;
  return Promise.resolve({ response: response });
}

function handleButtonClean() {
  const validElements = getValidPageElements();
  // The buttonClean must drop all borders because all borders may be highlighted.
  unhighlightAll(validElements);
  state.indexToHighlight = 0;
}

function handleButtonShowSources() {
  const elements = getPageElements();
  logDetections(elements);
  const analysis = getPageAnalysis(elements);
  return Promise.resolve({ response: analysis.sourcesSummary });
}

function handleButtonShowLogs(message) {
  state.showLogs = message.values;
}

function handleButtonHighlightAllAutomatically(message) {
  state.highlightAllAutomatically = message.values;
  const validElements = getValidPageElements();
  if (state.highlightAllAutomatically) {
    highlightAll(validElements);
  } else {
    unhighlightAll(validElements);
  }
}

function handleSourcesUpdate(message) {
  const blacklistEntry = message.values.find((item) =>
    item.type.includes(URL_TYPE_BLACKLIST),
  );
  state.blacklistedSources = blacklistEntry?.values ?? [];
  const notifyEntry = message.values.find((item) =>
    item.type.includes(URL_TYPE_NOTIFY),
  );
  state.notifySources = notifyEntry?.values ?? [];
  analyzePageAndSend();
}

function reportErrorContentScript(error) {
  console.error(`Error: ${error}`);
}

function highlightAllIfRequired(elements, mustSetBorder) {
  if (mustSetBorder) {
    highlightAll(elements);
  }
}

function highlightAll(elements) {
  elements.forEach((element) => highlight(element));
}

function highlight(element) {
  element.node.classList.add(HIGHLIGHT_CLASS);
}

function unhighlightAll(elements) {
  elements.forEach((element) => unhighlight(element));
}

function unhighlight(element) {
  element.node.classList.remove(HIGHLIGHT_CLASS);
}

function isThereAnySourceToNotify(elements, notifySources) {
  const sources = elements.map((element) => element.source.toLowerCase());
  return notifySources.some((notifySource) =>
    sources.some((source) => source.includes(notifySource.toLowerCase())),
  );
}

function scroll(element) {
  element.node.scrollIntoView({
    block: "end",
    behavior: "smooth",
  });
}

function summaryOfTheHighlightedElement(elements, indexToHighlight) {
  return (
    "Detection " +
    (indexToHighlight + 1) +
    "/" +
    elements.length +
    ": " +
    elements[indexToHighlight].tag +
    " tag"
  );
}

// check page required information and send results
function analyzePageAndSend() {
  const elements = getPageElements();
  logDetections(elements);
  const analysis = getPageAnalysis(elements);
  browser.runtime.sendMessage({
    tagsExist: analysis.tagsExist,
    referers: state.refererSources,
    locationUrl: analysis.locationUrl,
  });
  return { elements, analysis };
}

function getPageAnalysis(elements) {
  return {
    locationUrl: getLocationUrl(elements),
    sourcesSummary: getSourcesSummary(elements),
    tagsExist: tagStatus(elements),
  };
}

// TODO understand why this only uses the first element
function getLocationUrl(elements) {
  const validElements = getNonBlacklistedElements(elements);
  return validElements.length > 0 ? validElements[0].source : false;
}

function getSourcesSummary(elements) {
  const frameElements = getElementsWithTag("frame");
  const iframeElements = getElementsWithTag("iframe");
  return {
    iframe: {
      sourcesAllNumber: iframeElements.length,
      sourcesValid: getNonBlacklistedSources(iframeElements),
    },
    frame: {
      sourcesAllNumber: frameElements.length,
      sourcesValid: getNonBlacklistedSources(frameElements),
    },
  };

  function getElementsWithTag(tag) {
    return elements.filter((element) => element.tag === tag);
  }
}

function tagStatus(elements) {
  if (isThereAnySourceToNotify(elements, state.notifySources)) {
    return TAGS_STATUS.NOTIFY_MATCH;
  } else if (elements.length > 0) {
    return TAGS_STATUS.FOUND;
  } else {
    return TAGS_STATUS.NOT_FOUND;
  }
}

function getValidPageElements() {
  const elements = getPageElements();
  logDetections(elements);
  return getNonBlacklistedElements(elements);
}

function getPageElements() {
  let result = [];
  for (const tag of ["frame", "iframe"]) {
    const nodes = document.getElementsByTagName(tag);
    for (const node of nodes) {
      result.push({
        tag,
        node,
        source: node.src || "",
      });
    }
  }
  return result;
}

function getNonBlacklistedSources(elements) {
  return getNonBlacklistedElements(elements).map((element) => element.source);
}

function getNonBlacklistedElements(elements) {
  return elements.filter((element) => !isBlacklistedSource(element.source));
}

function isBlacklistedSource(source) {
  return state.blacklistedSources.some((blacklisted) =>
    source.toLowerCase().includes(blacklisted.toLowerCase()),
  );
}

function logDetections(elements) {
  if (state.showLogs) {
    console.log("checkIframe) check-and-border) tags info: ", elements);
  }
}
