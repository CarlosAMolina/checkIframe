// Sets browser-global URL type constants for Jest tests.
// buttons.js references these as free identifiers because babel-plugin-rewire
// resolves named import bindings as global lookups inside class bodies.
const {
  URL_TYPE_BLACKLIST,
  URL_TYPE_NOTIFY,
  URL_TYPE_REFERER,
} = require("../src/popup/url.js");

global.URL_TYPE_BLACKLIST = URL_TYPE_BLACKLIST;
global.URL_TYPE_NOTIFY = URL_TYPE_NOTIFY;
global.URL_TYPE_REFERER = URL_TYPE_REFERER;
