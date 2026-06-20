// Sets browser-global URL type constants for Jest tests.
// These are needed because check-and-border.js reads them as globals (it is
// a plain content script, not an ES module, so it cannot use import).
const {
  URL_TYPE_BLACKLIST,
  URL_TYPE_NOTIFY,
  URL_TYPE_REFERER,
} = require("../src/popup/url.js");

global.URL_TYPE_BLACKLIST = URL_TYPE_BLACKLIST;
global.URL_TYPE_NOTIFY = URL_TYPE_NOTIFY;
global.URL_TYPE_REFERER = URL_TYPE_REFERER;
