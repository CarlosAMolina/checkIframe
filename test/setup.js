// Sets browser-global constants for Jest tests.
// In the browser these are provided by constants.js loaded as a plain script.
// Jest does not execute HTML <script> tags, so we set them here before any
// test file loads its modules.
const {
  URL_TYPE_BLACKLIST,
  URL_TYPE_NOTIFY,
  URL_TYPE_REFERER,
} = require("../src/constants.js");

global.URL_TYPE_BLACKLIST = URL_TYPE_BLACKLIST;
global.URL_TYPE_NOTIFY = URL_TYPE_NOTIFY;
global.URL_TYPE_REFERER = URL_TYPE_REFERER;
