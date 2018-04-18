var info2sendFromPopup;
var paragraph2ChangeID;

// listen for clicks on the buttons, and send the appropriate message to
// the content script in the web page.
function listenForClicks() {
  document.addEventListener("click", (e) => {

    // send value
    function sendValue(tabs) {
      console.log('pop-up) send value');
      browser.tabs.sendMessage(tabs[0].id, {
        info: info2sendFromPopup
      });
    }

    // send value, save and show the answer
    function sendValueSaveAndShowAnswer(tabs) {
      var answer;
      function changeParagraph() {
        if (typeof answer != 'undefined'){ // check if the answer has been received
          document.getElementById(paragraph2ChangeID).innerHTML = String(answer);
        } else {
          document.getElementById(paragraph2ChangeID).innerHTML = 'No info received from the content script.';
        }
      }
      for (let tab of tabs) {
        browser.tabs.sendMessage(
          tab.id,
          {info: info2sendFromPopup}
        ).then(response => {
          answer = response.response;
          changeParagraph(answer);
        }).catch(reportError);
      }
      console.log("pop-up) send message to the content script and save the response: ", answer);
    }

    // log the error to the console.
    function reportError(error) {
      console.error(`Error: ${error}`);
      console.log("pop-up) send message: error");
    }
    // show or hide info
    function showInfo(){
      document.querySelector('#'+paragraph2ChangeID).classList.remove("hidden");
      console.log('pop-up) show: ',paragraph2ChangeID);
    }
    function hideInfo(){
      document.querySelector('#'+paragraph2ChangeID).classList.add("hidden");
      console.log('pop-up) hide: ',paragraph2ChangeID);
    }
    function showOrHideInfo(){
      if (document.getElementById(paragraph2ChangeID).classList.contains("hidden")){
        showInfo();
      } else {
        hideInfo();
      }
    }

    // get the active tab, then call the appropriate function
    if (e.target.classList.contains('recheck')){
      console.log('pop-up) recheck');
      info2sendFromPopup = 'recheck';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValue)
        .catch(reportError);
    } else if (e.target.classList.contains("clean")) {
      console.log('pop-up) clean');
      paragraph2ChangeID = 'infoScroll';
      info2sendFromPopup = 'clean';
      hideInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValue)
        .catch(reportError);
    } else if (e.target.classList.contains("scroll")){
      console.log('pop-up) scroll');
      paragraph2ChangeID = 'infoScroll';
      info2sendFromPopup = 'scroll';
      showInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValueSaveAndShowAnswer)
        .catch(reportError);
    } else if (e.target.classList.contains("showSources")){
      console.log('pop-up) showSources');
      paragraph2ChangeID='infoTags';
      info2sendFromPopup = 'showSources';
      showOrHideInfo();
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValueSaveAndShowAnswer)
        .catch(reportError);
    }
  });
}

// there was an error executing the script.
// display the pop-up's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to check this web page: ${error.message}`);
}

// when the pop-up loads, inject a content script into the active tab,
// and add a click handler.
// if we couldn't inject the script, handle the error.
browser.tabs.executeScript({file: "/checkAndBorder.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
