let debug = false;

// These logs are shown in the Developer Tools console, not in the console logs of the current browser's tab.
export function log(...args) {
  if (debug) {
    console.log(...args);
  }
}

export function logError(error) {
  console.error(error);
}

export const _forTesting = {
  setDebug(value) {
    debug = value;
  },
};
