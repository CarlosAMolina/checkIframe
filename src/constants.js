const URL_TYPE_BLACKLIST = "blacklist";
const URL_TYPE_NOTIFY = "notify";
const URL_TYPE_REFERER = "referer";

// In the browser this file is loaded as a plain script, so `module` does not
// exist. The guard prevents a ReferenceError while still allowing Node.js
// (Jest) to import these constants via require().
if (typeof module !== "undefined") {
  module.exports = {
    URL_TYPE_BLACKLIST,
    URL_TYPE_NOTIFY,
    URL_TYPE_REFERER,
  };
}
