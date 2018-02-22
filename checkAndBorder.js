//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts

var elementsIframe;
var iframeExists;

// get elements iframe
function getElementsIframe() {
  elementsIframe = document.getElementsByTagName("iframe");
  console.log('checkAndborder) iframe elements saved');
}

// check iframe
function checkIframe() {
  if (elementsIframe.length > 0) {
    iframeExists = 1;
  }
  else {
    iframeExists = 0;
  }
  console.log("checkAndBorder) iframe exists:", iframeExists);
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

// scroll to iframe element
function scroll2IframeElement(){
  elementsIframe[0].scrollIntoView();
  console.log("checkAndBorder) scroll");
}

// borderify window
function borderifyWindow(){
  if (iframeExists == 1) {
    document.body.style.border = "5px solid red";
    console.log("checkAndBorder) border: red");
  }
  else {
    document.body.style.border = "5px solid yellow";
    console.log("checkAndBorder) border: yellow");
  }
}

// borderify iframe element
function borderifyIframeElement(){
  if (iframeExists == 1) {
    elementsIframe[0].style.border = "10px solid red";
    console.log("checkAndBorder) iframe element border: red");
  }
}

// show pop-up
function showpopup(what2show){
  alert(what2show);
  console.log("checkAndBorder) pop-up");
}

// send value to the background script
function sendValueFromContentScript(value2send) {
  browser.runtime.sendMessage({"value": value2send});
  console.log("checkAndBorder) send message: ", value2send);
}

function checkAndSend(){
  getElementsIframe();
  checkIframe();
  identifyIframe();
  sendValueFromContentScript(iframeExists);
  //scroll2IframeElement();
  //borderifyIframeElement();
}

//main

console.log("\ncheckAndBorder) main");

// listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  console.log("checkAndBorder) save message: ", message);
  if (message.info === "protocolok"){
    checkAndSend();
    console.log("checkAndBorder) supported protocol");
  }
});