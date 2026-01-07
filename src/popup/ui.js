import { getStrTagsHtml } from "./tags-html.js";
import { removeChildren } from "./dom.js";

export const infoContainer = document.querySelector(".info-container");
const sourcesContainer = document.querySelector(".sources-container");

export function showSources(tagSummary) {
  cleanShowSources();
  const htmlStr = getStrTagsHtml(tagSummary["frame"], tagSummary["iframe"]);
  sourcesContainer.insertAdjacentHTML("afterbegin", htmlStr);
  setupSourcesCopyButtonListeners();
}

function cleanShowSources() {
  removeChildren(sourcesContainer);
}

// TODO private
export function setupSourcesCopyButtonListeners() {
  const buttons = document.querySelectorAll(".detections button");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("mouseleave", function () {
      button.classList.toggle("show");
    });
    button.addEventListener("click", function () {
      const url = this.parentElement.querySelector("a").href;
      // Find the anchor tag in the same list item
      // Copy the URL to the clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
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
