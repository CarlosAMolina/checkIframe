import { removeChildren } from "./dom.js";

export const infoContainer = document.querySelector(".info-container");
export const sourcesContainer = document.querySelector(".sources-container");

export function cleanShowSources() {
  removeChildren(sourcesContainer);
}
