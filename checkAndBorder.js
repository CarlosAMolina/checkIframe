function element(tag, info) {
  this.tag = tag;
  this.info = info;
  this.source = info.src;
  this.sourceIsValid=0;
  if (invalidSources.indexOf(this.source) == -1){
    this.sourceIsValid=1;
  }
}
var elements = [];
var elementsValidSrc = [];
var elementsValidSrcIndex;
var elementsValidSrcIndex2QuitBorder;
var invalidSources = [];
var notifySources = [];
var refererSources = [];
var showLogs = 0;
var tags2Search = ['iframe','frame'];
var urlTypeBlacklist = 'blacklist';
var urlTypeNotify = 'notify';
var urlTypeReferer = 'referer';

var tabUrlMocked = 'https://github.com/carlosamolina'; //TODO receive url from background.

// initialize
function initializeContentScript() {
  function reportErrorContentScript(error) {
    console.error(`Error: ${error}`);
  }
  getElementsByTags();
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    if (typeof(results.idShowLogs) != 'undefined'){ // 'show log' option has never been used
      showLogs = results.idShowLogs;
    }
    invalidSources = Object.keys(results).filter(key => key.includes(urlTypeBlacklist+'_')); //array
    invalidSources = invalidSources.map(source => results[source]); // array
    notifySources = Object.keys(results).filter(key => key.includes(urlTypeNotify+'_')); //array
    notifySources = notifySources.map(source => results[source]); // array
    refererSources = Object.keys(results).filter(key => key.includes(urlTypeReferer+'_')); //array
    refererSources = refererSources.map(source => results[source]); // array
    logs();
  }, reportErrorContentScript);
}

// get elements
function getElementsByTags() {
  elements = []; // initialize
  tags2Search.forEach(function(tag2search){
    var elementsByTag = document.getElementsByTagName(tag2search);
    for (elementIndex=0; elementIndex < elementsByTag.length; elementIndex++){
      var result = new element(tag2search,elementsByTag[elementIndex]);
      elements.push(result);
    }
  });
}

// logs
function logs(){
  if (showLogs == 1) {
    console.log('checkIframe) checkAndBorder) tags info: ',elements);
  }
}

initializeContentScript();

(function() {

  // check and set a global guard variable.
  // if this content script is injected into the same web page again,
  // it will do nothing next time.
  // avoid saving pop-up messages twice
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // check if any source should be notified
  function checkSrcInList(){
    var srcInlist = 0;
    if (elements.length != 0 && notifySources.length != 0){
      var allSourcesStr = String(elements.map(function(sourcesFunc) {return sourcesFunc.source})).toLowerCase();
      for (i=0; i < notifySources.length; i++){
        var notifySource = notifySources[i].toLowerCase();
	    if (allSourcesStr.indexOf(notifySource) != -1){
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
    if (checkSrcInList() == 1){
      return 2;
    } else if (elements.length != 0){
      return 1;
    } else{
      return 0;
    }
  }

  // save sources
  function getSources(){
    var sourcesStr = ''; // initialize
    function sources2Str(){
      if (tagValidSources.length == 0){
        sourcesStr += '<u>' + tagElements.length + ' elements with tag <b>' + tags2Search[tagIndex] + '</b></u>. Without sources.<br/><br/>';
      } else if (tagValidSources.length == 1){
        sourcesStr += '<u>' + tagElements.length + ' element with tag <b>' + tags2Search[tagIndex] + '</b></u>. ' + tagValidSources.length + ' source:<br/><br/>';
      } else {
        sourcesStr += '<u>' + tagElements.length + ' elements with tag <b>' + tags2Search[tagIndex] + '</b></u>. ' + tagValidSources.length + ' sources:<br/><br/>';
      }
      for (i=0; i<tagValidSources.length; i++){
        sourcesStr += (i+1) + ' - <a href="' + tagValidSources[i] + '">' + tagValidSources[i] + '</a><br/><br/>'; 
      }
      return sourcesStr;
    }
    if (elements.length != 0){
      for (tagIndex=0; tagIndex < tags2Search.length; tagIndex++){
        var tagElements = elements.filter(function (elementsFunc) {return elementsFunc.tag == tags2Search[tagIndex]} );
        var tagElementsValidSrc = tagElements.filter(function (elementsFunc) {return elementsFunc.sourceIsValid == 1} ); // object
        var tagValidSources = tagElementsValidSrc.map(function(sourcesFunc) {return sourcesFunc.source}); // array
        sourcesStr = sources2Str();
      }
    } else {
      sourcesStr = 'Web page without tags: ' + tags2Search.toString() + '.';
    }
    return sourcesStr;
  }

  // show element
  function showElement(){
    function getIndex2Show(){
      if ( typeof elementsValidSrcIndex != 'undefined' && elementsValidSrcIndex+1 < elementsValidSrc.length){
        elementsValidSrcIndex = elementsValidSrcIndex+1;
      } else {
        elementsValidSrcIndex = 0;
      }
    }
    function getIndexInfo(){
      var tagElements = elementsValidSrc.filter(function (elementsFunc) {return elementsFunc.tag == elementsValidSrc[elementsValidSrcIndex].tag} );
      var tag2SearchIndex = tags2Search.indexOf(elementsValidSrc[elementsValidSrcIndex].tag);
      var previousTagsElementsNumber = 0; // includes the number of elements for the actual tag
      for (i=0; i<=tag2SearchIndex; i++){
        previousTagsElementsNumber += (elementsValidSrc.filter(function (elementsFunc) {return elementsFunc.tag == tags2Search[i]})).length;
      }
      if (elementsValidSrcIndex >= previousTagsElementsNumber) {
        var tagElementsIndex = elementsValidSrc.length - previousTagsElementsNumber;
      } else {
        var tagElementsIndex = elementsValidSrcIndex;
      }
      return 'tag ' + elementsValidSrc[elementsValidSrcIndex].tag + ', source ' + (tagElementsIndex+1) + '/' +  tagElements.length;
    }
    function scrollAndBorder(){
      (elementsValidSrc[elementsValidSrcIndex].info).scrollIntoView(false); //false: element in the lower part of the window
      quitBorder();
      (elementsValidSrc[elementsValidSrcIndex].info).style.border = ' 10px solid red ';     
      elementsValidSrcIndex2QuitBorder = elementsValidSrcIndex;     
    }
    var indexInfo = 'Web page without sources.';
    if (elements.length != 0){
      getElementsValidSrc();
      if (elementsValidSrc.length != 0){
        getIndex2Show();
        scrollAndBorder();
        var indexInfo = getIndexInfo();
      }
    }
    return indexInfo;
  }

  // quit border
  function quitBorder(){
    if (typeof(elementsValidSrcIndex2QuitBorder) != 'undefined' && typeof(elementsValidSrc[elementsValidSrcIndex2QuitBorder]) != 'undefined'){ // elementsValidSrc[elementsValidSrcIndex2QuitBorder].info can be 'undefined' when working with the blacklist
      (elementsValidSrc[elementsValidSrcIndex2QuitBorder].info).style.border = '';     
    }
  }

  // check page required infromation and send results
  function checkAndSend(){
    browser.runtime.sendMessage(
      {"tagsExist": checkTags(),
       "referers": refererSources,
       "locationUrl": getLocationUrl()
      }
    );
  }

  function getLocationUrl() {
    getElementsByTags();
    getElementsValidSrc();
    return (elementsValidSrc.length > 0) ? elementsValidSrc[0].source : false;
  }

  //main

  // listen for messages from the background script and the pop-up
  browser.runtime.onMessage.addListener((message) => { 
    if (message.info === 'protocolok'){
      //checkRunRedirectAndSend(); // TODO set in correct place.
      checkAndSend();
    } else if (message.info === 'recheck'){
      checkAndSend();
      logs();
    } else if (message.info === 'scroll'){
      checkTags();
      var scrollInfo = showElement();
      logs();
      return Promise.resolve({response: scrollInfo});
    } else if (message.info === 'clean'){
      checkTags(); // when the pop-up is closed, this info is lost
      getElementsValidSrc(); // when the pop-up is closed, this info is lost
      quitBorder();
      elementsValidSrcIndex = undefined;
      elementsValidSrcIndex2QuitBorder = undefined;
    } else if (message.info === 'showSources'){
      checkTags();
      var sourcesStr = getSources();
      logs();
      return Promise.resolve({response: sourcesStr});
    } else if (message.info === 'showLogs'){
      showLogs = message.values;
      logs();
    } else if (message.info === 'urls'){
      invalidSources = message.values.filter (values => values.type.includes(urlTypeBlacklist))[0].values; //array
      notifySources = message.values.filter (values => values.type.includes(urlTypeNotify))[0].values; //array
      checkAndSend();
      logs();
    }
  });

  // get elements with valid sources
  function getElementsValidSrc (){
    elementsValidSrc = elements.filter(function (elementsFunc) {return elementsFunc.sourceIsValid == 1} );
  }

  
})();
