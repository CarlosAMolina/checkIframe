import { getTagsDom } from "./tags-html.js";
import { HTML_ID_INFO_SCROLL } from "./dom.js";
import { HTML_ID_INFO_TAGS } from "./dom.js";
import { removeChildren } from "./dom.js";
import { reportError } from "./log.js";

export const infoContainer = document.querySelector(".info-container");
const sourcesContainer = document.querySelector(".sources-container");

export function getUrlsInInputBox() {
  return document.querySelector('textarea[id="inputUrl"]').value.split("\n");
}

export function setShowSourcesError(error) {
  setUiError(error, HTML_ID_INFO_TAGS);
}

export function setInfoScrollError(error) {
  setUiError(error, HTML_ID_INFO_SCROLL);
}

export function showSources(tagSummary) {
  cleanShowSources();
  const tagsDom = getTagsDom(tagSummary["frame"], tagSummary["iframe"]);
  sourcesContainer.appendChild(tagsDom);
  setupSourcesCopyButtonListeners();
}

function setUiError(error, htmlId) {
  reportError(error);
  document.getElementById(htmlId).textContent =
    "Internal error. The action could not be executed";
}

function cleanShowSources() {
  removeChildren(sourcesContainer);
}

function setupSourcesCopyButtonListeners() {
  const buttons = document.querySelectorAll(".detections button");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("mouseleave", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("click", function () {
      const url = this.parentElement.querySelector("a").textContent;
      // Find the anchor tag in the same list item
      // Copy the URL to the clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log(`Copied (length=${url.length}): ${url}`);
          const button = this.parentElement.querySelector("button");
          const image = button.querySelector("img");
          const tooltip = button.querySelector("span");
          const originalText = tooltip.textContent;
          const originalSrc = image.src;
          image.src = "/icons/ok.svg";
          tooltip.textContent = "Copied";
          // Avoid wrong behaviour if the user clicks when the temporal image is displayed.
          button.disabled = true;
          setTimeout(() => {
            image.src = originalSrc;
            tooltip.textContent = originalText;
            button.disabled = false;
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  });
}
