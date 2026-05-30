import * as urlModule from "../../src/popup/url.js";
import * as fakeModule from "../fake.js";

it("getUrlTypeActive returns the active url type", function () {
  fakeModule.runFakeDom("src/popup/popup.html");
  document.getElementById("buttonUrlsBlacklist").checked = true;
  expect(urlModule.getUrlTypeActive()).toEqual("blacklist");
});
