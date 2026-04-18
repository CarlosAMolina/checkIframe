const TAGS_STATUS = {
  NOT_FOUND: 0,
  FOUND: 1,
  NOTIFY_MATCH: 2,
};
const state = {
  blacklistedSources: [],
  elements: [],
  highlightAllAutomatically: false,
  indexToHighlight: 0,
  notifySources: [],
};
let refererSources = [];
let showLogs = false;

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
  logDetections();
  // Listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => {
    const handler = handlers[message.info];
    return handler(message);
  });
})();

function initializeGlobalVariables() {
  state.elements = detectElements();
  browser.storage.local
    .get({
      idShowLogs: false,
      idHighlightAllAutomatically: false,
    })
    .then(({ idShowLogs, idHighlightAllAutomatically }) => {
      showLogs = idShowLogs;
      state.highlightAllAutomatically = idHighlightAllAutomatically;
    })
    .catch((error) => reportErrorContentScript(error));
  browser.storage.local
    .get(null)
    .then((results) => {
      for (const [key, value] of Object.entries(results)) {
        if (key.startsWith(URL_TYPE_BLACKLIST + "_")) {
          state.blacklistedSources.push(value);
        } else if (key.startsWith(URL_TYPE_NOTIFY + "_")) {
          state.notifySources.push(value);
        } else if (key.startsWith(URL_TYPE_REFERER + "_")) {
          refererSources.push(value);
        }
      }
    })
    .catch(reportErrorContentScript);
}

function detectElements() {
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

function logDetections() {
  if (showLogs) {
    console.log("checkIframe) check-and-border) tags info: ", state.elements);
  }
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

function tagStatus() {
  if (isThereAnySourceToNotify(state.elements, state.notifySources)) {
    return TAGS_STATUS.NOTIFY_MATCH;
  } else if (state.elements.length > 0) {
    return TAGS_STATUS.FOUND;
  } else {
    return TAGS_STATUS.NOT_FOUND;
  }
}

function isThereAnySourceToNotify(elements, notifySources) {
  const sources = elements.map((element) => element.src.toLowerCase());
  return notifySources.some((notifySource) =>
    sources.some((source) => source.includes(notifySource.toLowerCase())),
  );
}

function calculateIndexToHighlight(elements, indexToHighlight) {
  return indexToHighlight >= elements.length ? 0 : indexToHighlight + 1;
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
function checkAndSend() {
  state.elements = detectElements();
  browser.runtime.sendMessage({
    tagsExist: tagStatus(),
    referers: refererSources,
    locationUrl: getLocationUrl(),
  });
}

// TODO understand why this only uses the first element
function getLocationUrl() {
  state.elements = detectElements();
  const validElements = filterNonBlacklistedElements(state.elements);
  return validElements.length > 0 ? validElements[0].source : false;
}

function handleProtocolOk() {
  checkAndSend();
  // Required to highlight all when changing to a different tab already open.
  browser.storage.local
    .get("idHighlightAllAutomatically")
    .then((result) => {
      if (result.idHighlightAllAutomatically !== undefined) {
        state.highlightAllAutomatically = result.idHighlightAllAutomatically;
      }
    })
    .catch((error) => {
      reportErrorContentScript(error);
    });
  setBorderOfAllElementsIfRequired(
    filterNonBlacklistedElements(state.elements),
    state.highlightAllAutomatically,
  );
}

function handleButtonRecheck() {
  checkAndSend();
  logDetections();
  setBorderOfAllElementsIfRequired(
    filterNonBlacklistedElements(state.elements),
    state.highlightAllAutomatically,
  );
  return Promise.resolve(getSourcesSummary());
}

function handleButtonScroll() {
  state.elements = detectElements();
  const validElements = filterNonBlacklistedElements(state.elements);
  logDetections();
  if (validElements.length === 0) {
    return Promise.resolve({ response: "No detections to show" });
  }
  quitBorder(validElements[state.indexToHighlight]);
  state.indexToHighlight = calculateIndexToHighlight(
    validElements,
    state.indexToHighlight,
  );
  scroll(validElements[state.indexToHighlight]);
  setBorder(validElements[state.indexToHighlight]);
  return Promise.resolve({
    response: summaryOfTheHighlightedElement(
      validElements,
      state.indexToHighlight,
    ),
  });
}

function handleButtonClean() {
  state.elements = detectElements(); // when the pop-up is closed, this info is lost
  const validElements = filterNonBlacklistedElements(state.elements); // when the pop-up is closed, this info is lost
  // The buttonClean must drop all borders because all borders may be highlighted.
  quitBorderOfAllElements(validElements);
  state.indexToHighlight = 0;
}

function handleButtonShowSources() {
  state.elements = detectElements();
  logDetections();
  return Promise.resolve({ response: getSourcesSummary() });
}

function handleButtonShowLogs(message) {
  showLogs = message.values;
  logDetections();
}
function handleButtonHighlightAllAutomatically(message) {
  state.highlightAllAutomatically = message.values;
  const validElements = filterNonBlacklistedElements(state.elements);
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
  checkAndSend();
  logDetections();
}

function getSourcesSummary() {
  return {
    iframe: {
      sourcesAllNumber: getElementsWithTag("iframe").length,
      sourcesValid: filterNonBlacklistedSources(getElementsWithTag("iframe")),
    },
    frame: {
      sourcesAllNumber: getElementsWithTag("frame").length,
      sourcesValid: filterNonBlacklistedSources(getElementsWithTag("frame")),
    },
  };

  function getElementsWithTag(tag) {
    return state.elements.filter((element) => element.tag == tag);
  }
}

function filterNonBlacklistedSources(elements) {
  return filterNonBlacklistedElements(elements).map(
    (element) => element.source,
  );
}

function filterNonBlacklistedElements(elements) {
  return elements.filter((element) => !isBlacklistedSource(element.source));
}

function isBlacklistedSource(source) {
  return state.blacklistedSources.some((blacklisted) =>
    source.toLowerCase().includes(blacklisted.toLowerCase()),
  );
}
