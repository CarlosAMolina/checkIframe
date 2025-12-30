export function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

export function toggleHide(htmlId) {
  document.getElementById(htmlId).classList.toggle("hidden");
}

export function unhide(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}

export function updateElementsWhenIncompatibleWebPage() {
  unhide("error-content");
  const elementsToHide = [
    "popup-content div.oneLineButtons",
    "infoScroll",
    "buttonShowSources",
  ];
  for (const element of elementsToHide) {
    hide(element);
  }
}
