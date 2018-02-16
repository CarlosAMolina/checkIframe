//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts

var iframeExists;

// check iframe
function checkIframe() {
  if (document.getElementsByTagName("iframe").length > 0) {
    iframeExists = 1;
  }
  else {
    iframeExists = 0;
  }
  console.log("checkAndBorder) iframe:", iframeExists);
}

// borderify
function borderify(){
  if (iframeExists == 1) {
    document.body.style.border = "5px solid red";
    console.log("checkAndBorder) border: red");
  }
  else {
    document.body.style.border = "5px solid yellow";
    console.log("checkAndBorder) border: yellow");
  }
}

// show pop-up
function showpopup(what2show){
  eval (alert(what2show));
  console.log("checkAndBorder) pop-up");
}

// send value to the background script
function sendValueFromContentScript(value2send) {
  browser.runtime.sendMessage({"value": value2send});
  console.log("checkAndBorder) send message: ", value2send);
}

function checkAndSend(){
  checkIframe();
  sendValueFromContentScript(iframeExists);
  //borderify();
  //showpopup(iframeExists);
}

//main

console.log("checkAndBorder) main");

// listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  console.log("checkAndBorder) save message: ", message);
  if (message.command === "value"){
    showpopup(message.info);
  }
  else if (message.command === "recheckIframe"){
    checkAndSend();
  }
});