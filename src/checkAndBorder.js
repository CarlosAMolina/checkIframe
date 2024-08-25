function element(tag, info) {
  this.tag = tag;
  this.info = info;
  this.source = info.src;
  this.sourceIsValid = invalidSources.indexOf(this.source) == -1 ? 1 : 0;
}
var elements = [];
var elementsValidSrc = [];
var elementsValidSrcIndex;
var elementsValidSrcIndex2QuitBorder;
var invalidSources = [];
var notifySources = [];
var refererSources = [];
var showLogs = 0;
var highlightAllAutomatically = 0;
var tags2Search = ["iframe", "frame"];
var urlTypeBlacklist = "blacklist";
var urlTypeNotify = "notify";
var urlTypeReferer = "referer";

// initialize
function initializeContentScript() {
  function reportErrorContentScript(error) {
    console.error(`Error: ${error}`);
  }
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
    invalidSources = Object.keys(results).filter((key) =>
      key.includes(urlTypeBlacklist + "_"),
    ); //array
    invalidSources = invalidSources.map((source) => results[source]); // array
    notifySources = Object.keys(results).filter((key) =>
      key.includes(urlTypeNotify + "_"),
    ); //array
    notifySources = notifySources.map((source) => results[source]); // array
    refererSources = Object.keys(results).filter((key) =>
      key.includes(urlTypeReferer + "_"),
    ); //array
    refererSources = refererSources.map((source) => results[source]); // array
    logs();
  }, reportErrorContentScript);
}

// get elements
function getElementsByTags() {
  elements = []; // initialize
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

// logs
function logs() {
  if (showLogs == 1) {
    console.log("checkIframe) checkAndBorder) tags info: ", elements);
  }
}

initializeContentScript();

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
      for (i = 0; i < notifySources.length; i++) {
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
      for (i = 0; i <= tag2SearchIndex; i++) {
        previousTagsElementsNumber += elementsValidSrc.filter(
          function (elementsFunc) {
            return elementsFunc.tag == tags2Search[i];
          },
        ).length;
      }
      if (elementsValidSrcIndex >= previousTagsElementsNumber) {
        var tagElementsIndex =
          elementsValidSrc.length - previousTagsElementsNumber;
      } else {
        var tagElementsIndex = elementsValidSrcIndex;
      }
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
    var indexInfo = "Web page without sources.";
    if (elements.length != 0) {
      getElementsValidSrc();
      if (elementsValidSrc.length != 0) {
        getIndex2Show();
        scrollAndBorder();
        var indexInfo = getIndexInfo();
      }
    }
    return indexInfo;
  }

  // check page required infromation and send results
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
    } else if (message.info === "buttonRecheck") {
      checkAndSend();
      logs();
    } else if (message.info === "buttonScroll") {
      checkTags();
      var scrollInfo = showElement();
      logs();
      return Promise.resolve({ response: scrollInfo });
    } else if (message.info === "buttonClean") {
      checkTags(); // when the pop-up is closed, this info is lost
      getElementsValidSrc(); // when the pop-up is closed, this info is lost
      quitBorderOfIndex(elementsValidSrc, elementsValidSrcIndex2QuitBorder);
      elementsValidSrcIndex = undefined;
      elementsValidSrcIndex2QuitBorder = undefined;
    } else if (message.info === "buttonShowSources") {
      checkTags();
      logs();
      return Promise.resolve({ response: getSourcesSummary() });
    } else if (message.info === "buttonShowLogs") {
      showLogs = message.values;
      logs();
    } else if (message.info === "buttonHighlightAllAutomatically") {
      highlightAllAutomatically = message.values;
    } else if (message.info === "urls") {
      invalidSources = message.values.filter((values) =>
        values.type.includes(urlTypeBlacklist),
      )[0].values; //array
      notifySources = message.values.filter((values) =>
        values.type.includes(urlTypeNotify),
      )[0].values; //array
      checkAndSend();
      logs();
    }
  });

  // get elements with valid sources
  function getElementsValidSrc() {
    elementsValidSrc = elements.filter(function (elementsFunc) {
      return elementsFunc.sourceIsValid == 1;
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
        .filter((element) => element.sourceIsValid === 1)
        .map((element) => element.source);
    }
  }
})();
