import * as domModule from "../../src/popup/dom.js";
import * as fakeModule from "../fake.js";

describe("dom", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
  });
  it("hide should add hidden", function () {
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    domModule.hide(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
  });
  it("toggleHide should add and remove hidden", function () {
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    domModule.toggleHide(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
    domModule.toggleHide(htmlId);
    expect(document.getElementById(htmlId).className).toBe("");
  });
  it("unhide should remove hidden", function () {
    const htmlId = "infoScroll";
    expect(document.getElementById(htmlId).className).toBe(
      "section backgroundGray hidden",
    );
    domModule.unhide(htmlId);
    expect(document.getElementById(htmlId).className).toBe(
      "section backgroundGray",
    );
  });
});
