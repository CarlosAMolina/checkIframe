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
    const expectedResult = new HtmlBuilder()
      .with_total(2)
      .with_element("Frame")
      .with_number("frames", 2)
      .with_not_blacklisted("frames", 2)
      .with_urls([])
      .with_element("IFrame")
      .with_number("iframes", 0)
      .build();
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
    const expectedResult = new HtmlBuilder()
      .with_total(5)
      .with_element("Frame")
      .with_number("frames", 2)
      .with_all_blacklisted("frames")
      .with_element("IFrame")
      .with_number("iframes", 3)
      .with_all_blacklisted("iframes")
      .build();
    expect(result).toBe(expectedResult);
  });
});
