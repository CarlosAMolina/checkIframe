if (
  typeof globalThis.browser === "undefined" &&
  typeof chrome !== "undefined"
) {
  globalThis.browser = chrome;
}
