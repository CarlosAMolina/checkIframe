const BORDER = " 10px solid red ";
const TAGS_2_SEARCH = ["iframe", "frame"];
let blacklistedSources = [];
let elements = [];
let elementsValidSrc = []; // TODO review if it is used, i dont see where a value is set.
let currentValidElementIndex;
let previousHighlightedIndex;
let highlightAllAutomatically = false;
let notifySources = [];
let refererSources = [];
let showLogs = false;

function reportErrorContentScript(error) {
  console.error(`Error: ${error}`);
}

function initializeContentScript() {
  elements = detectElements();
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    // 'show log' option has never been used
    if (typeof results.idShowLogs != "undefined") {
      showLogs = results.idShowLogs;
    }
    // 'Highlight all automatically' option has never been used
    if (typeof results.idHighlightAllAutomatically != "undefined") {
      highlightAllAutomatically = results.idHighlightAllAutomatically;
    }
    blacklistedSources = Object.keys(results).filter((key) =>
      key.includes(URL_TYPE_BLACKLIST + "_"),
    ); //array
    blacklistedSources = blacklistedSources.map((source) => results[source]); // array
    notifySources = Object.keys(results).filter((key) =>
      key.includes(URL_TYPE_NOTIFY + "_"),
    ); //array
    notifySources = notifySources.map((source) => results[source]); // array
    refererSources = Object.keys(results).filter((key) =>
      key.includes(URL_TYPE_REFERER + "_"),
    ); //array
    refererSources = refererSources.map((source) => results[source]); // array
    logDetectedTags();
  }, reportErrorContentScript);
}

function detectElements() {
  let result = [];
  for (const tag of TAGS_2_SEARCH) {
    const nodes = document.getElementsByTagName(tag);
    for (const node of nodes) {
      result.push(createDetectedElement(tag, node));
    }
  }
  return result;
}

function createDetectedElement(tag, node) {
  return {
    tag,
    node,
    source: node.src || "",
  };
}

function logDetectedTags() {
  if (showLogs) {
    console.log("checkIframe) check-and-border) tags info: ", elements);
  }
}

// elementsValidSrc: type elementsValidSrc
// mustSetBorder: type integer
function setBorderOfAllElementsIfRequired(elementsValidSrc, mustSetBorder) {
  if (mustSetBorder == 1) {
    setBorderOfAllElements(elementsValidSrc);
  }
}

// elementsValidSrc: type elementsValidSrc
// mustSetBorder: type integer
function setBorderOfAllElements(elementsValidSrc) {
  elementsValidSrc.forEach((element) => setBorder(element));
}

// elementsValidSrc: type elementsValidSrc
// mustSetBorder: type integer
function quitBorderOfAllElements(elementsValidSrc) {
  elementsValidSrc.forEach((element) => quitBorderOfElement(element));
}

function setBorder(element) {
  updateBorderOfElement(element, BORDER);
}

// elementsValidSrc[previousHighlightedIndex].node can be 'undefined' when working with the blacklist
// elementsValidSrc: type elementsValidSrc
// index: type int or "undefined"
function quitBorderOfIndex(elementsValidSrc, index) {
  if (typeof index != "undefined") {
    let elementToModify = elementsValidSrc[index];
    if (typeof elementToModify != "undefined") {
      quitBorderOfElement(elementToModify);
    }
  }
}

function quitBorderOfElement(element) {
  const borderValue = "";
  updateBorderOfElement(element, borderValue);
}

// value: string
function updateBorderOfElement(element, value) {
  element.info.style.border = value;
}

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

  // check if any source should be notified
  function checkSrcInList() {
    var srcInlist = 0;
    if (elements.length != 0 && notifySources.length != 0) {
      var allSourcesStr = String(
        elements.map(function (sourcesFunc) {
          return sourcesFunc.source;
        }),
      ).toLowerCase();
      for (let i = 0; i < notifySources.length; i++) {
        var notifySource = notifySources[i].toLowerCase();
        if (allSourcesStr.indexOf(notifySource) != -1) {
          i = i + notifySources.length; // finish loop
          srcInlist = 1;
        }
      }
    }
    return srcInlist;
  }

  // check elements
  function checkTags() {
    elements = detectElements();
    if (checkSrcInList() == 1) {
      return 2;
    } else if (elements.length != 0) {
      return 1;
    } else {
      return 0;
    }
  }

  function showElement() {
    function getIndex2Show() {
      if (
        typeof currentValidElementIndex != "undefined" &&
        currentValidElementIndex + 1 < elementsValidSrc.length
      ) {
        currentValidElementIndex = currentValidElementIndex + 1;
      } else {
        currentValidElementIndex = 0;
      }
    }
    function getIndexInfo() {
      var tagElements = elementsValidSrc.filter(function (elementsFunc) {
        return elementsFunc.tag == elementsValidSrc[currentValidElementIndex].tag;
      });
      var tag2SearchIndex = TAGS_2_SEARCH.indexOf(
        elementsValidSrc[currentValidElementIndex].tag,
      );
      var previousTagsElementsNumber = 0; // includes the number of elements for the actual tag
      for (let i = 0; i <= tag2SearchIndex; i++) {
        previousTagsElementsNumber += elementsValidSrc.filter(
          function (elementsFunc) {
            return elementsFunc.tag == TAGS_2_SEARCH[i];
          },
        ).length;
      }
      const tagElementsIndex =
        currentValidElementIndex >= previousTagsElementsNumber
          ? elementsValidSrc.length - previousTagsElementsNumber
          : currentValidElementIndex;
      return (
        "Tag " +
        elementsValidSrc[currentValidElementIndex].tag +
        ": source " +
        (tagElementsIndex + 1) +
        "/" +
        tagElements.length
      );
    }
    function scrollAndBorder() {
      let elementToSetBorder = elementsValidSrc[currentValidElementIndex];
      elementToSetBorder.info.scrollIntoView(false); //false: element in the lower part of the window
      quitBorderOfIndex(elementsValidSrc, previousHighlightedIndex);
      setBorder(elementToSetBorder);
      previousHighlightedIndex = currentValidElementIndex;
    }
    let indexInfo = "No elements to show";
    if (elements.length != 0) {
      elements = filterNonBlacklistedElements(elements);
      if (elementsValidSrc.length != 0) {
        getIndex2Show();
        scrollAndBorder();
        indexInfo = getIndexInfo();
      }
    }
    return indexInfo;
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
    return elementsValidSrc.length > 0 ? elementsValidSrc[0].source : false;
  }

  //main

  // listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => {
    if (message.info === "protocolok") {
      checkAndSend();
      // Required to highlight all when changing to a different tab already open.
      let gettingItem = browser.storage.local.get(
        "idHighlightAllAutomatically",
      );
      gettingItem.then((result) => {
        if (typeof result.idHighlightAllAutomatically != "undefined") {
          highlightAllAutomatically = result.idHighlightAllAutomatically;
        }
        setBorderOfAllElementsIfRequired(
          elementsValidSrc,
          highlightAllAutomatically,
        );
      }, reportErrorContentScript);
    } else if (message.info === "buttonRecheck") {
      checkAndSend();
      logDetectedTags();
      setBorderOfAllElementsIfRequired(
        elementsValidSrc,
        highlightAllAutomatically,
      );
      return Promise.resolve(getSourcesSummary());
    } else if (message.info === "buttonScroll") {
      checkTags();
      var scrollInfo = showElement();
      logDetectedTags();
      return Promise.resolve({ response: scrollInfo });
    } else if (message.info === "buttonClean") {
      checkTags(); // when the pop-up is closed, this info is lost
      elements = filterNonBlacklistedElements(elements); // when the pop-up is closed, this info is lost
      // The buttonClean must drop all borders and not only one border
      // by index because all borders may be highlighted.
      quitBorderOfAllElements(
        elementsValidSrc,
        previousHighlightedIndex,
      );
      currentValidElementIndex = undefined;
      previousHighlightedIndex = undefined;
    } else if (message.info === "buttonShowSources") {
      checkTags();
      logDetectedTags();
      return Promise.resolve({ response: getSourcesSummary() });
    } else if (message.info === "buttonShowLogs") {
      showLogs = message.values;
      logDetectedTags();
    } else if (message.info === "buttonHighlightAllAutomatically") {
      highlightAllAutomatically = message.values;
      if (highlightAllAutomatically) {
        setBorderOfAllElements(elementsValidSrc);
      } else {
        quitBorderOfAllElements(elementsValidSrc);
      }
    } else if (message.info === "urls") {
      blacklistedSources = message.values.filter((values) =>
        values.type.includes(URL_TYPE_BLACKLIST),
      )[0].values; //array
      notifySources = message.values.filter((values) =>
        values.type.includes(URL_TYPE_NOTIFY),
      )[0].values; //array
      checkAndSend();
      logDetectedTags();
    }
  });

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
