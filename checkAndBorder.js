function element(info, tag) {
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
var invalidSources=['about:blank',''];
var tags2Search = ['iframe','frame'];

(function() {

  // check and set a global guard variable.
  // if this content script is injected into the same web page again,
  // it will do nothing next time.
  // avoid saving pop-up messages twice
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // get elements
  function getElementsByTags() {
    elements = []; // initialize
    for (tagIndex=0; tagIndex < tags2Search.length; tagIndex++){
      console.log('checkAndborder) getElementsByTags) searching elements with tag:', tags2Search[tagIndex]);
      var elementsByTag = document.getElementsByTagName(tags2Search[tagIndex]);
      for (elementIndex=0; elementIndex < elementsByTag.length; elementIndex++){
        var result = new element(elementsByTag[elementIndex], tags2Search[tagIndex]);      
        elements.push(result);
      }
    }
    console.log('checkAndborder) getElementsByTags) elements (',elements.length,'):', elements);
  }

  // check elements
  function checkTags() {
    getElementsByTags();
    if (elements.length != 0){
      console.log("checkAndBorder) checkTags) tags were found");
      return 1;
    } else{
      console.log("checkAndBorder) checkTags) no tags");
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
        console.log('checkAndBorder) getSources) ',tagElements.length,' elements with tag ',tags2Search[tagIndex],':', tagElements);
        console.log('checkAndBorder) getSources) ', tagValidSources.length, ' sources for elements with tag ',tags2Search[tagIndex],':', tagValidSources);
      }
    } else {
      sourcesStr = 'Web page without tags: ' + tags2Search.toString() + '.';
    }
    console.log('checkAndBorder) getSources) sources: ', sourcesStr);
    return sourcesStr;
  }

  // get elements with valid sources
  function getElementsValidSrc (){
    if (elementsValidSrc.length == 0){
      elementsValidSrc = elements.filter(function (elementsFunc) {return elementsFunc.sourceIsValid == 1} );
    }
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
      console.log('checkAndBorder) getIndexInfo) actual source for tag ', elementsValidSrc[elementsValidSrcIndex].tag, ':', (tagElementsIndex+1), '/', tagElements.length);
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
    if (typeof elementsValidSrcIndex2QuitBorder != 'undefined'){
      (elementsValidSrc[elementsValidSrcIndex2QuitBorder].info).style.border = '';     
    }
  }

  // send message to the background script
  function sendValue2Background(value2send) {
    browser.runtime.sendMessage({"value": value2send});
    console.log("checkAndBorder) sendValue2Background) send message to the background script: ", value2send);
  }

  // check iframe and send results
  function checkAndSend(){
    sendValue2Background(checkTags());
  }
  
  //main
  
  console.log("\ncheckAndBorder) main");
  
  // listen for messages from the background script
  browser.runtime.onMessage.addListener((message) => { 
    console.log("checkAndBorder) save message: ", message);
    console.log("checkAndBorder) save message: ", message.info);
    if (message.info === 'protocolok'){
      console.log("checkAndBorder) supported protocol");
      checkAndSend();
    } else if (message.info === 'recheck'){
      console.log("checkAndBorder) recheck");
      checkAndSend();
    } else if (message.info === 'scroll'){
      console.log('checkAndBorder) scroll) scroll and border');
      checkTags();
      var scrollInfo = showElement();
      return Promise.resolve({response: scrollInfo});
    } else if (message.info === 'clean'){
      console.log('checkAndBorder) clean)');
      checkTags(); // when the pop-up is closed, this info is lost
      getElementsValidSrc();  // when the pop-up is closed, this info is lost
      quitBorder();
      elementsValidSrcIndex = undefined;
      elementsValidSrcIndex2QuitBorder = undefined;
    } else if (message.info === 'showSources'){
      console.log('checkAndBorder) showSources)');
      checkTags();
      var sourcesStr = getSources();
      return Promise.resolve({response: sourcesStr});
    }
  });

})();
