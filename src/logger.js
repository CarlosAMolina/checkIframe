const DEBUG = true;

export function log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

export function logError(error) {
  console.error(error);
}
