function element(tag, info) {
  this.tag = tag;
  this.info = info;
  this.source = info.src;
  this.isBlacklisted = blacklistedSources.includes(this.source);
}
var elements = [];
var elementsValidSrc = [];
var elementsValidSrcIndex;
var elementsValidSrcIndex2QuitBorder;
var blacklistedSources = [];
var notifySources = [];
var refererSources = [];
var showLogs = false;
var highlightAllAutomatically = false;
var tags2Search = ["iframe", "frame"];

function reportErrorContentScript(error) {
  console.error(`Error: ${error}`);
}

function initializeContentScript() {
  getElementsByTags();
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

function getElementsByTags() {
  elements = [];
  tags2Search.forEach(function (tag2search) {
    var elementsByTag = document.getElementsByTagName(tag2search);
    for (
      let elementIndex = 0;
      elementIndex < elementsByTag.length;
      elementIndex++
    ) {
      var result = new element(tag2search, elementsByTag[elementIndex]);
      elements.push(result);
    }
  });
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
  elementsValidSrc.forEach((element) => setBorderOfElement(element));
}

// elementsValidSrc: type elementsValidSrc
// mustSetBorder: type integer
function quitBorderOfAllElements(elementsValidSrc) {
  elementsValidSrc.forEach((element) => quitBorderOfElement(element));
}

// elementToModify: type element
function setBorderOfElement(elementToModify) {
  const borderValue = " 10px solid red ";
  updateBorderOfElement(elementToModify, borderValue);
}

// elementsValidSrc[elementsValidSrcIndex2QuitBorder].info can be 'undefined' when working with the blacklist
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

// elementToModify: type element
function quitBorderOfElement(elementToModify) {
  const borderValue = "";
  updateBorderOfElement(elementToModify, borderValue);
}

// elementToModify: type element
// value: string
function updateBorderOfElement(elementToModify, value) {
  elementToModify.info.style.border = value;
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
    getElementsByTags();
    if (checkSrcInList() == 1) {
      return 2;
    } else if (elements.length != 0) {
      return 1;
    } else {
      return 0;
    }
  }

  // show element
  function showElement() {
    function getIndex2Show() {
      if (
        typeof elementsValidSrcIndex != "undefined" &&
        elementsValidSrcIndex + 1 < elementsValidSrc.length
      ) {
        elementsValidSrcIndex = elementsValidSrcIndex + 1;
      } else {
        elementsValidSrcIndex = 0;
      }
    }
    function getIndexInfo() {
      var tagElements = elementsValidSrc.filter(function (elementsFunc) {
        return elementsFunc.tag == elementsValidSrc[elementsValidSrcIndex].tag;
      });
      var tag2SearchIndex = tags2Search.indexOf(
        elementsValidSrc[elementsValidSrcIndex].tag,
      );
      var previousTagsElementsNumber = 0; // includes the number of elements for the actual tag
      for (let i = 0; i <= tag2SearchIndex; i++) {
        previousTagsElementsNumber += elementsValidSrc.filter(
          function (elementsFunc) {
            return elementsFunc.tag == tags2Search[i];
          },
        ).length;
      }
      const tagElementsIndex =
        elementsValidSrcIndex >= previousTagsElementsNumber
          ? elementsValidSrc.length - previousTagsElementsNumber
          : elementsValidSrcIndex;
      return (
        "Tag " +
        elementsValidSrc[elementsValidSrcIndex].tag +
        ": source " +
        (tagElementsIndex + 1) +
        "/" +
        tagElements.length
      );
    }
    function scrollAndBorder() {
      let elementToSetBorder = elementsValidSrc[elementsValidSrcIndex];
      elementToSetBorder.info.scrollIntoView(false); //false: element in the lower part of the window
      quitBorderOfIndex(elementsValidSrc, elementsValidSrcIndex2QuitBorder);
      setBorderOfElement(elementToSetBorder);
      elementsValidSrcIndex2QuitBorder = elementsValidSrcIndex;
    }
    let indexInfo = "No elements to show";
    if (elements.length != 0) {
      getElementsValidSrc();
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
    getElementsByTags();
    getElementsValidSrc();
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
      getElementsValidSrc(); // when the pop-up is closed, this info is lost
      // The buttonClean must drop all borders and not only one border
      // by index because all borders may be highlighted.
      quitBorderOfAllElements(
        elementsValidSrc,
        elementsValidSrcIndex2QuitBorder,
      );
      elementsValidSrcIndex = undefined;
      elementsValidSrcIndex2QuitBorder = undefined;
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

  // get elements with valid sources
  function getElementsValidSrc() {
    elementsValidSrc = elements.filter(function (element) {
      return !element.isBlacklisted;
    });
  }

  function getSourcesSummary() {
    return {
      iframe: {
        sourcesAllNumber: getElementsWithTag("iframe").length,
        sourcesValid: getValidSourcesOfElements(getElementsWithTag("iframe")),
      },
      frame: {
        sourcesAllNumber: getElementsWithTag("frame").length,
        sourcesValid: getValidSourcesOfElements(getElementsWithTag("frame")),
      },
    };

    function getElementsWithTag(tag) {
      return elements.filter((element) => element.tag == tag);
    }

    function getValidSourcesOfElements(elementsWithTag) {
      return elementsWithTag
        .filter((element) => !element.isBlacklisted)
        .map((element) => element.source);
    }
  }
})();
