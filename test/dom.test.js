import { runFakeDom } from "./fake.js";
import * as domModule from "../src/popup/dom.js";

describe("dom", () => {
  beforeEach(() => {
    runFakeDom("src/popup/popup.html");
  });
  it("hide should add hidden", function () {
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    domModule.hide(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
  });
  it("hideOrUnhide should add and remove hidden", function () {
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    domModule.hideOrUnhide(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
    domModule.hideOrUnhide(htmlId);
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
