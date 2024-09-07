export function getStrTagsHtml(frameTagSummary, iframeTagSummary) {
    const countDetectedTags = frameTagSummary.sourcesAllNumber + iframeTagSummary.sourcesAllNumber;
    let result = `<p>Total number of frames and iframes: ${countDetectedTags}</p>`;
    result += '\n';
    result += getTagHtml("frame", frameTagSummary);
    result += '\n';
    result += getTagHtml("iframe", iframeTagSummary);
    return result;
}

function getTagHtml(tag, tagSummary) {
    let result = `<p>Total number of ${tag}s: ${tagSummary.sourcesValid.length}</p>`;
    result += '\n';
    result += `<p>Not blacklisted ${tag}s (${tagSummary.sourcesValid.length}):</p>`;
    result += '\n';
    result += getUrlsHtml(tagSummary);
    return result
}

function getUrlsHtml(tagSummary) {
    let elements = "";
    for (let index = 0; index < tagSummary.sourcesValid.length; index++) {
      const url = tagSummary.sourcesValid[index];
      const urlHtml = `<a href="${url}">${url}</a>`
      elements += `\n  <li>${urlHtml}</li>`
    }
    return `<ol>${elements}\n</ol>`
}
