export function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

export function toggleHide(htmlId) {
  if (document.getElementById(htmlId).classList.contains("hidden")) {
    unhide(htmlId);
  } else {
    hide(htmlId);
  }
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
