import { log } from "./logger.js";
import { logError } from "./logger.js";

const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];

export function isProtocolSupported(url) {
  const protocol = getProtocol(url);
  return SUPPORTED_PROTOCOLS.includes(protocol);
}

function getProtocol(url) {
  log(`Tab url: ${url}`);
  try {
    return new URL(url).protocol;
  } catch (error) {
    logError(`Failed to parse URL "${url}":`, error);
    return "";
  }
}
