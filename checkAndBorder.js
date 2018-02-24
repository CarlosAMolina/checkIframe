var elementsIframe;
var iframeExists;
var iframeElementNextNumber=0;
var iframeElementActualNumber;
var iframesSourcesStr='';

(function() {

  // check and set a global guard variable.
  // if this content script is injected into the same page again,
  // it will do nothing next time.
  // avoid saving pop-up messages twice
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // check iframe
  function checkIframe() {
    if (elementsIframe.length > 0) {
      iframeExists = 1;
    } else {
      iframeExists = 0;
    }
    console.log("checkAndBorder) iframe exists:", iframeExists);
    console.log("checkAndBorder) number of iframe elements:", elementsIframe.length);
  }
  
  // get elements iframe
  function getElementsIframe() {
    elementsIframe = document.getElementsByTagName("iframe");
    console.log('checkAndborder) iframe elements saved');
  }

  // get next elements iframe
  function getNextIframeElement(){
   iframeElementActualNumber = iframeElementNextNumber;
    if (iframeElementNextNumber < elementsIframe.length-1){
      iframeElementNextNumber += 1;
    } else{
      iframeElementNextNumber = 0;
    }  
    console.log('checkAndBorder) actual iframe element number: ', iframeElementActualNumber);
    console.log('checkAndBorder) next iframe element number: ', iframeElementNextNumber);
  }  
  
  // identify iframe
  function identifyIframe() {
    if (iframeExists == 1){
      for (i=0; i<elementsIframe.length; i++){
        console.log('checkAndBorder) iframe ',i,' :',elementsIframe[i]);
        console.log('checkAndBorder) iframe num. ',i,' src:', elementsIframe[i].src);
      }
    }
  }

  // save iframes sources
  function saveIframesSources(){
    iframesSourcesStr = ''; // clean the variable
    if (iframeExists == 1){
      for (i=0; i<elementsIframe.length; i++){
        iframesSourcesStr += i+1 + ' - ' + elementsIframe[i].src + '<br /><br />';
        console.log('checkAndBorder) iframes sources in string: ', iframesSourcesStr);
      }
    } else{
      iframesSourcesStr = 'Without iframe to show information';
    }
  }
  
  // scroll to iframe element
  function scroll2IframeElement(){
    elementsIframe[iframeElementNextNumber].scrollIntoView(false); //false: element in the lower part of the window
    console.log("checkAndBorder) scroll to iframe ", iframeElementNextNumber);
  }
  
  // borderify window
  function borderifyWindow(){
    if (iframeExists == 1) {
      document.body.style.border = "5px solid red";
      console.log("checkAndBorder) border: red");
    } else {
      document.body.style.border = "5px solid yellow";
      console.log("checkAndBorder) border: yellow");
    }
  }

  // borderify iframe element
  function borderifyIframeElement(){
    if (iframeExists == 1) {
      if (iframeElementNextNumber > 0) {
        borderifyIframeElementQuit (iframeElementActualNumber);
      }
      elementsIframe[iframeElementNextNumber].style.border = "10px solid red";
      console.log('checkAndBorder) iframe element ', iframeElementNextNumber, ' border: red');
    }
  }

  // quit border to the iframe element
  function borderifyIframeElementQuit(iframeElementNumber2QuitBorder){
    elementsIframe[iframeElementNumber2QuitBorder].style.border = "";
    console.log('checkAndBorder) quit border to iframe element ', iframeElementNumber2QuitBorder);
  }

  // show pop-up
  function showpopup(what2show){
    alert(what2show);
    console.log("checkAndBorder) pop-up");
  }
  
  // send message to the background script
  function sendValue2Background(value2send) {
    browser.runtime.sendMessage({"value": value2send});
    console.log("checkAndBorder) send message to the background script: ", value2send);
  }

  // check iframe and send results
  function checkAndSend(){
    getElementsIframe();
    checkIframe();
    identifyIframe();
    sendValue2Background(iframeExists);
  }
  
  //main
  
  console.log("\ncheckAndBorder) main");
  
  // listen for messages from the background script
  browser.runtime.onMessage.addListener((message) => { 
    console.log("checkAndBorder) save message: ", message);
    console.log("checkAndBorder) save message: ", message.info);
    if (message.info === 'protocolok'){
      checkAndSend();
      console.log("checkAndBorder) supported protocol");
    } else if (message.info === 'recheck'){
      checkAndSend();
      console.log("checkAndBorder) recheck");
    } else if (message.info === 'scroll'){
      console.log('checkAndBorder) scroll and border');
      scroll2IframeElement();
      borderifyIframeElement();
      getNextIframeElement();
    } else if (message.info === 'clean'){
      console.log('checkAndBorder) clean');
      borderifyIframeElementQuit(iframeElementActualNumber);
      iframeElementNextNumber=0;
    } else if (message.info === 'showSources'){
      console.log('checkAndBorder) send sources to pop-up');
      saveIframesSources();
      return Promise.resolve({response: iframesSourcesStr});
    }
  });

})();
