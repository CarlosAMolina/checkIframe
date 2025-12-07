export function getStrTagsHtml(frameTagSummary, iframeTagSummary) {
  const countDetectedTags =
    frameTagSummary.sourcesAllNumber + iframeTagSummary.sourcesAllNumber;
  let result = `<p>Total number of frames and iframes: ${countDetectedTags}</p>`;
  if (countDetectedTags > 0) {
    result += "\n";
    result += "<p><u>Frame elements</u></p>";
    result += "\n";
    result += getTagHtml("frame", frameTagSummary);
    result += "\n";
    result += "<p><u>IFrame elements</u></p>";
    result += "\n";
    result += getTagHtml("iframe", iframeTagSummary);
  }
  return result;
}

function getTagHtml(tag, tagSummary) {
  let result = `<p>Total number of ${tag}s: ${tagSummary.sourcesAllNumber}</p>`;
  if (tagSummary.sourcesAllNumber > 0) {
    result += "\n";
    if (tagSummary.sourcesValid.length == 0) {
      result += `<p>All ${tag}s are blacklisted</p>`;
    } else {
      result += `<p>Not blacklisted ${tag}s (${tagSummary.sourcesValid.length}):</p>`;
      result += "\n";
      result += getUrlsHtml(tagSummary);
    }
  }
  return result;
}

function getUrlsHtml(tagSummary) {
  const elements = [];
  for (const url of tagSummary.sourcesValid) {
    const element = `<li>
  <button class="tooltip">
  <span class="tooltiptext">Copy to clipboard</span>
  <img src="/icons/copy.svg" />
</button> <a href="${url}">${url}</a>
</li>`;
    elements.push(`  ${element}`);
  }
  return `<ol class="detections">\n${elements.join("\n")}\n</ol>`;
}
