import { removeChildren } from "./dom.js";

export const sourcesContainer = document.querySelector(".sources-container");

export function cleanShowSources() {
  removeChildren(sourcesContainer);
}
