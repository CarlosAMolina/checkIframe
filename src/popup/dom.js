export function hide(htmlId) {
  document.querySelector("#" + htmlId).classList.add("hidden");
}

export function unhide(htmlId) {
  document.querySelector("#" + htmlId).classList.remove("hidden");
}

export function showOrHideInfo(htmlId) {
  if (document.getElementById(htmlId).classList.contains("hidden")) {
    unhide(htmlId);
  } else {
    hide(htmlId);
  }
}
