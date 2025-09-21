import { getStrTagsHtml } from "../src/popup/tagsHtml.js";
import { getFileContent } from "./readFile.js";
import { HtmlBuilder } from "./builder.js";

describe.only("Check getTagsHtml", () => {
  it("Check expected HTML if no frame or iframe tags", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const result = getStrTagsHtml(frameTagsSummary, iframeTagsSummary);
    const expectedResult = new HtmlBuilder().with_total(0).build();
    expect(result).toBe(expectedResult);
  });
  it("Check expected HTML if only frame", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: ["https://frame1.com", "about:blank"],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const result = getStrTagsHtml(frameTagsSummary, iframeTagsSummary);
    const expectedResult = getFileContent("html/tags-only-frame.html");
    expect(result).toBe(expectedResult);
  });
  it("Check expected HTML if multiple frame and iframe tags", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: ["https://frame1.com", "about:blank"],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 3,
      sourcesValid: [
        "https://iframe1.com",
        "https://iframe2.com",
        "https://iframe3.com",
      ],
    };
    const result = getStrTagsHtml(frameTagsSummary, iframeTagsSummary);
    const expectedResult = getFileContent(
      "html/tags-multiple-frame-and-iframe.html",
    );
    expect(result).toBe(expectedResult);
  });
  it("Check expected HTML if multiple frame and iframe tags but blacklisted", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: [],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 3,
      sourcesValid: [],
    };
    const result = getStrTagsHtml(frameTagsSummary, iframeTagsSummary);
    const expectedResult = `${new HtmlBuilder()
      .with_total(5)
      .with_element("Frame")
      .build()}
<p>Total number of frames: 2</p>
<p>All frames are blacklisted</p>
<p><u>IFrame elements</u></p>
<p>Total number of iframes: 3</p>
<p>All iframes are blacklisted</p>`;
    expect(result).toBe(expectedResult);
  });
});
