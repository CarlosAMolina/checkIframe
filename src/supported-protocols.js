const SUPPORTED_PROTOCOLS = ["https:", "http:", "file:"];

export function isProtocolSupported(url) {
  const protocol = getProtocol(url);
  return SUPPORTED_PROTOCOLS.includes(protocol);
}

function getProtocol(url) {
  console.log(`Tab url: ${url}`);
  try {
    return new URL(url).protocol;
  } catch (error) {
    console.error(`Failed to parse URL "${url}":`, error);
    return "";
  }
}
