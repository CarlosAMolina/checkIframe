export const HTML_ID_ERROR_CONTENT = "error-content";
export const HTML_ID_INFO_SCROLL = "infoScroll";
export const HTML_ID_INFO_TAGS = "infoTags";
export const HTML_ID_MENU_CONFIG = "menuConfig";

export function isHidden(idHtml) {
  return document.getElementById(idHtml).classList.contains("hidden");
}

export function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

export function removeChildren(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

export function toggleHide(htmlId) {
  document.getElementById(htmlId).classList.toggle("hidden");
}

export function unhide(htmlId) {
  document.getElementById(htmlId).classList.remove("hidden");
}

export function updateElementsWhenIncompatibleWebPage() {
  unhide(HTML_ID_ERROR_CONTENT);
  const elementsToHide = [
    "popup-content div.oneLineButtons",
    HTML_ID_INFO_SCROLL,
    HTML_ID_INFO_TAGS,
    "buttonShowSources",
  ];
  for (const element of elementsToHide) {
    hide(element);
  }
}
