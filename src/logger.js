let debug = false;

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
