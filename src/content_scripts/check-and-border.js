const BORDER = " 10px solid red ";
const TAGS_STATUS = {
  NOT_FOUND: 0,
  FOUND: 1,
  NOTIFY_MATCH: 2,
};
const TAGS_TO_SEARCH = ["iframe", "frame"];
let blacklistedSources = [];
let elements = [];
let indexToHighlight;
let lastHighlightedIndex;
let highlightAllAutomatically = false;
let notifySources = [];
let refererSources = [];
let showLogs = false;

function initializeContentScript() {
  elements = detectElements();
  logDetectedTags();
  browser.storage.local
    .get({
      idShowLogs: false,
      idHighlightAllAutomatically: false,
    })
    .then(({ idShowLogs, idHighlightAllAutomatically }) => {
      showLogs = idShowLogs;
      highlightAllAutomatically = idHighlightAllAutomatically;
    })
    .catch((error) => reportErrorContentScript(error));
  browser.storage.local
    .get(null)
    .then((results) => {
      for (const [key, value] of Object.entries(results)) {
        if (key.startsWith(URL_TYPE_BLACKLIST + "_")) {
          blacklistedSources.push(value);
        } else if (key.startsWith(URL_TYPE_NOTIFY + "_")) {
          notifySources.push(value);
        } else if (key.startsWith(URL_TYPE_REFERER + "_")) {
          refererSources.push(value);
        }
      }
    })
    .catch(reportErrorContentScript);
}

function detectElements() {
  let result = [];
  for (const tag of TAGS_TO_SEARCH) {
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

function logDetectedTags() {
  if (showLogs) {
    console.log("checkIframe) check-and-border) tags info: ", elements);
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
  const borderValue = "";
  updateBorderOfElement(element, borderValue);
}

function setBorder(element) {
  updateBorderOfElement(element, BORDER);
}

// value: string
function updateBorderOfElement(element, value) {
  element.node.style.border = value;
}

// TODO move code to the top of the file and called functions to the down side
initializeContentScript();

(function () {
  // check and set a global guard variable.
  // if this content script is injected into the same web page again,
  // it will do nothing next time.
  // avoid saving pop-up messages twice
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // check elements
  function checkTags() {
    elements = detectElements();
    if (isThereAnySourceToNotify(elements, notifySources)) {
      return TAGS_STATUS.NOTIFY_MATCH;
    } else if (elements.length > 0) {
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

  function showElement() {
    elements = filterNonBlacklistedElements(elements);
    if (elements.length === 0) {
      return "No detections to show";
    }
    indexToHighlight =
      indexToHighlight === undefined ||
      indexToHighlight >= elements.length
        ? 0
        : indexToHighlight + 1;
    elements[indexToHighlight].node.scrollIntoView({
      block: "end",
      behavior: "smooth",
    });
    quitBorder(elements[lastHighlightedIndex]);
    setBorder(elements[indexToHighlight]);
    lastHighlightedIndex = indexToHighlight;
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
    browser.runtime.sendMessage({
      tagsExist: checkTags(),
      referers: refererSources,
      locationUrl: getLocationUrl(),
    });
  }

  function getLocationUrl() {
    elements = detectElements();
    elements = filterNonBlacklistedElements(elements);
    return elements.length > 0 ? elements[0].source : false;
  }

  //main

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

  // Listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => {
    const handler = handlers[message.info];
    return handler(message);
  });

  function handleProtocolOk() {
    checkAndSend();
    // Required to highlight all when changing to a different tab already open.
    browser.storage.local
      .get("idHighlightAllAutomatically")
      .then((result) => {
        if (result.idHighlightAllAutomatically !== undefined) {
          highlightAllAutomatically = result.idHighlightAllAutomatically;
        }
      })
      .catch((error) => {
        reportErrorContentScript(error);
      });
    setBorderOfAllElementsIfRequired(
      filterNonBlacklistedElements(elements),
      highlightAllAutomatically,
    );
  }

  function handleButtonRecheck() {
    checkAndSend();
    logDetectedTags();
    setBorderOfAllElementsIfRequired(
      filterNonBlacklistedElements(elements),
      highlightAllAutomatically,
    );
    return Promise.resolve(getSourcesSummary());
  }

  function handleButtonScroll() {
    checkTags();
    const scrollInfo = showElement();
    logDetectedTags();
    return Promise.resolve({ response: scrollInfo });
  }

  function handleButtonClean() {
    checkTags(); // when the pop-up is closed, this info is lost
    elements = filterNonBlacklistedElements(elements); // when the pop-up is closed, this info is lost
    // The buttonClean must drop all borders because all borders may be highlighted.
    quitBorderOfAllElements(elements);
    indexToHighlight = undefined;
    lastHighlightedIndex = undefined;
  }

  function handleButtonShowSources() {
    checkTags();
    logDetectedTags();
    return Promise.resolve({ response: getSourcesSummary() });
  }

  function handleButtonShowLogs() {
    showLogs = message.values;
    logDetectedTags();
  }
  function handleButtonHighlightAllAutomatically() {
    highlightAllAutomatically = message.values;
    elements = filterNonBlacklistedElements(elements);
    if (highlightAllAutomatically) {
      setBorderOfAllElements(elements);
    } else {
      quitBorderOfAllElements(elements);
    }
  }

  function handleSourcesUpdate() {
    const blacklistEntry = message.values.find((item) =>
      item.type.includes(URL_TYPE_BLACKLIST),
    );
    blacklistedSources = blacklistEntry?.values ?? [];
    const notifyEntry = message.values.find((item) =>
      item.type.includes(URL_TYPE_NOTIFY),
    );
    notifySources = notifyEntry?.values ?? [];
    checkAndSend();
    logDetectedTags();
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
      return elements.filter((element) => element.tag == tag);
    }
  }
})();

function filterNonBlacklistedSources(elements) {
  return filterNonBlacklistedElements(elements).map(
    (element) => element.source,
  );
}

function filterNonBlacklistedElements(elements) {
  return elements.filter((element) => !isBlacklistedSource(element.source));
}

function isBlacklistedSource(source) {
  return blacklistedSources.some((blacklisted) =>
    source.toLowerCase().includes(blacklisted.toLowerCase()),
  );
}
