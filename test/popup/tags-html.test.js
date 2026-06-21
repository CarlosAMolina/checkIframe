import * as tagsHtmlModule from "../../src/popup/tags-html.js";
import * as htmlBuilderModule from "../builder.js";
import * as fakeModule from "../fake.js";

describe("Check getTagsDom", () => {
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");
  });
  it("Check expected DOM if no frame or iframe tags", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const result = tagsHtmlModule.getTagsDom(
      frameTagsSummary,
      iframeTagsSummary,
    );
    const container = document.createElement("div");
    container.appendChild(result);
    const actualHtml = container.innerHTML.replace(/>\s+</g, "><");
    const expectedHtml = new htmlBuilderModule.HtmlBuilder()
      .with_total(0)
      .build()
      .replace(/>\s+</g, "><");
    expect(actualHtml).toBe(expectedHtml);
  });
  it("Check expected DOM if only frame", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: ["https://frame1.com", "about:blank"],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const result = tagsHtmlModule.getTagsDom(
      frameTagsSummary,
      iframeTagsSummary,
    );
    const container = document.createElement("div");
    container.appendChild(result);
    const actualHtml = container.innerHTML.replace(/>\s+</g, "><");
    const expectedHtml = new htmlBuilderModule.HtmlBuilder()
      .with_total(2)
      .with_element("Frame")
      .with_number("frames", 2)
      .with_not_blacklisted("frames", 2)
      .with_urls(["https://frame1.com", "about:blank"])
      .with_element("IFrame")
      .with_number("iframes", 0)
      .build()
      .replace(/>\s+</g, "><")
      .replace(/svg" \//g, 'svg"');
    expect(actualHtml).toBe(expectedHtml);
  });
  it("Check expected DOM if multiple frame and iframe tags", function () {
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
    const result = tagsHtmlModule.getTagsDom(
      frameTagsSummary,
      iframeTagsSummary,
    );
    const container = document.createElement("div");
    container.appendChild(result);
    const actualHtml = container.innerHTML.replace(/>\s+</g, "><");
    const expectedHtml = new htmlBuilderModule.HtmlBuilder()
      .with_total(5)
      .with_element("Frame")
      .with_number("frames", 2)
      .with_not_blacklisted("frames", 2)
      .with_urls(["https://frame1.com", "about:blank"])
      .with_element("IFrame")
      .with_number("iframes", 3)
      .with_not_blacklisted("iframes", 3)
      .with_urls([
        "https://iframe1.com",
        "https://iframe2.com",
        "https://iframe3.com",
      ])
      .build()
      .replace(/>\s+</g, "><")
      .replace(/svg" \//g, 'svg"');
    expect(actualHtml).toBe(expectedHtml);
  });
  it("Check expected DOM if multiple frame and iframe tags but blacklisted", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: [],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 3,
      sourcesValid: [],
    };
    const result = tagsHtmlModule.getTagsDom(
      frameTagsSummary,
      iframeTagsSummary,
    );
    const container = document.createElement("div");
    container.appendChild(result);
    const actualHtml = container.innerHTML.replace(/>\s+</g, "><");
    const expectedHtml = new htmlBuilderModule.HtmlBuilder()
      .with_total(5)
      .with_element("Frame")
      .with_number("frames", 2)
      .with_all_blacklisted("frames")
      .with_element("IFrame")
      .with_number("iframes", 3)
      .with_all_blacklisted("iframes")
      .build()
      .replace(/>\s+</g, "><");
    expect(actualHtml).toBe(expectedHtml);
  });
});
