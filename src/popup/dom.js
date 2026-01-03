export function getIdHtmlClicked(eventClick) {
  // The user can click a button or an image.
  return eventClick.target.id || eventClick.target.parentElement.id;
}

export function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

// This is necessay to avoid changes in the pop-up width.
export function setNewElementsMaxWidth() {
  const maxWidthCurrentWindow =
    document.getElementById("buttonShowConfig").offsetWidth;
  const widthToReduceToAvoidVisualSizeChange = 5;
  const maxWidthNewElements =
    maxWidthCurrentWindow - widthToReduceToAvoidVisualSizeChange;
  const maxWidthNewElementsStr = `${maxWidthNewElements}px`;
  const htmlIdsToModify = ["infoScroll", "menuConfig", "infoTags"];
  for (const htmlId of htmlIdsToModify) {
    document.getElementById(htmlId).style.maxWidth = maxWidthNewElementsStr;
  }
}

export function toggleHide(htmlId) {
  document.getElementById(htmlId).classList.toggle("hidden");
}

export function unhide(htmlId) {
  document.getElementById(htmlId).classList.remove("hidden");
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
