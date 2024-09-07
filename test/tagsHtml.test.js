import { getStrTagsHtml } from "../src/popup/tagsHtml.js";
import { getFileContent } from "./readFile.js";

describe.only("Check getTagsHtml", () => {
  it("Check expected HTML", function () {
      const frameTagsSummary = {
        sourcesAllNumber: 2,
        sourcesValid: ["https://frame1.com", "about:blank"],
      };
      const iframeTagsSummary = {
        sourcesAllNumber: 3,
        sourcesValid: ["https://iframe1.com", "https://iframe2.com", "https://iframe3.com"],
      };
      const result = getStrTagsHtml(frameTagsSummary, iframeTagsSummary);
      const expectedResult = getFileContent("html/tags-multiple-frame-and-iframe.html");
      expect(result).toBe(expectedResult);
  });
});
