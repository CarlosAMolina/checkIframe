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

(function () {
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
  initializeGlobalVariables();
  // Listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => {
    const handler = handlers[message.info];
    return handler(message);
  });
})();

function initializeGlobalVariables() {
  browser.storage.local
    .get({
      idShowLogs: false,
      idHighlightAllAutomatically: false,
    })
    .then(({ idShowLogs, idHighlightAllAutomatically }) => {
      state.showLogs = idShowLogs;
      state.highlightAllAutomatically = idHighlightAllAutomatically;
    })
    .catch((error) => reportErrorContentScript(error));
  browser.storage.local
    .get(null)
    .then((results) => {
      state.blacklistedSources = [];
      state.notifySources = [];
      state.refererSources = [];
      for (const [key, value] of Object.entries(results)) {
        if (key.startsWith(URL_TYPE_BLACKLIST + "_")) {
          state.blacklistedSources.push(value);
        } else if (key.startsWith(URL_TYPE_NOTIFY + "_")) {
          state.notifySources.push(value);
        } else if (key.startsWith(URL_TYPE_REFERER + "_")) {
          state.refererSources.push(value);
        }
      }
    })
    .catch(reportErrorContentScript);
}

function handleProtocolOk() {
  const { elements } = detectAndSend();
  // Required to highlight all when changing to a different tab already open.
  browser.storage.local
    .get("idHighlightAllAutomatically")
    .then((result) => {
      if (result.idHighlightAllAutomatically !== undefined) {
        state.highlightAllAutomatically = result.idHighlightAllAutomatically;
      }
      setBorderOfAllElementsIfRequired(
        getNonBlacklistedElements(elements),
        state.highlightAllAutomatically,
      );
    })
    .catch(reportErrorContentScript);
}

function handleButtonRecheck() {
  const { elements, analysis } = detectAndSend();
  setBorderOfAllElementsIfRequired(
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
  const indexToQuitHighlight =
    state.indexToHighlight === 0
      ? validElements.length - 1
      : state.indexToHighlight - 1;
  quitBorder(validElements[indexToQuitHighlight]);
  scroll(validElements[state.indexToHighlight]);
  setBorder(validElements[state.indexToHighlight]);
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
  quitBorderOfAllElements(validElements);
  state.indexToHighlight = 0;
}

function handleButtonShowSources() {
  const elements = getPageElements();
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
    setBorderOfAllElements(validElements);
  } else {
    quitBorderOfAllElements(validElements);
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
  detectAndSend();
}

function reportErrorContentScript(error) {
  console.error(`Error: ${error}`);
}

function setBorderOfAllElementsIfRequired(elements, mustSetBorder) {
  if (mustSetBorder) {
    setBorderOfAllElements(elements);
  }
}

function setBorderOfAllElements(elements) {
  elements.forEach((element) => setBorder(element));
}

function quitBorderOfAllElements(elements) {
  elements.forEach((element) => quitBorder(element));
}

function quitBorder(element) {
  updateBorderOfElement(element, "");
}

function setBorder(element) {
  updateBorderOfElement(element, " 10px solid red ");
}

function updateBorderOfElement(element, value) {
  element.node.style.border = value;
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
function detectAndSend() {
  const elements = getPageElements();
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
  return getNonBlacklistedElements(getPageElements());
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
  logDetections(elements);
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
