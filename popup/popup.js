var elementsIframeSources;
var info2sendFromPopup;

// listen for clicks on the buttons, and send the appropriate message to
// the content script in the page.
function listenForClicks() {
  document.addEventListener("click", (e) => {

    function sendValueSaveAnswerShowIframes(tabs) {
      for (let tab of tabs) {
        browser.tabs.sendMessage(
          tab.id,
          {info: "showSources"}
        ).then(response => {
          elementsIframeSources = response.response;
          console.log("pop-up) send message to the content script and save the reponse: ", response.response);
          changeParagraph(elementsIframeSources);
        }).catch(reportError);
      }
    }

    function sendValue(tabs) {
      console.log('pop-up) send value');
      browser.tabs.sendMessage(tabs[0].id, {
        command: "recheckIframeFromPopup",
        info: info2sendFromPopup
      });
    }

    // just log the error to the console.
    function reportError(error) {
      console.error(`Error: ${error}`);
      console.log("pop-up) send message: error");
    }

    function changeParagraph(whatShow) {
      console.log('pop-up) show iframes sources: ', whatShow);
      if (typeof whatShow != 'undefined'){ // check if information was received from the content script
        document.getElementById("showInfo").innerHTML = whatShow;
      } else {
        document.getElementById("showInfo").innerHTML = 'Click again';
      }
    }

    // get the active tab, then call the appropriate function
    if (e.target.classList.contains("recheck")) {
      console.log('pop-up) recheck');
      info2sendFromPopup = 'recheck';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValue)
        .catch(reportError);
    } else if (e.target.classList.contains("scroll")) {
      console.log('pop-up) scroll');
      info2sendFromPopup = 'scroll';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValue)
        .catch(reportError);
    } else if (e.target.classList.contains("clean")) {
      console.log('pop-up) clean');
      info2sendFromPopup = 'clean';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValue)
        .catch(reportError);
    } else if (e.target.classList.contains("showSources")) {
      console.log('pop-up) showSources');
      info2sendFromPopup = 'showSources';
      browser.tabs.query({active: true, currentWindow: true})
        .then(sendValueSaveAnswerShowIframes)
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
