export function getTagsDom(frameTagSummary, iframeTagSummary) {
  const fragment = document.createDocumentFragment();
  const countDetectedTags =
    frameTagSummary.sourcesAllNumber + iframeTagSummary.sourcesAllNumber;
  const totalParagraph = document.createElement("p");
  totalParagraph.textContent = `Total number of frames and iframes: ${countDetectedTags}`;
  fragment.appendChild(totalParagraph);
  if (countDetectedTags > 0) {
    fragment.appendChild(createElementHeader("Frame"));
    fragment.appendChild(getTagDom("frame", frameTagSummary));
    fragment.appendChild(createElementHeader("IFrame"));
    fragment.appendChild(getTagDom("iframe", iframeTagSummary));
  }
  return fragment;
}

function createElementHeader(tag) {
  const paragraph = document.createElement("p");
  const u = document.createElement("u");
  u.textContent = `${tag} elements`;
  paragraph.appendChild(u);
  return paragraph;
}

function getTagDom(tag, tagSummary) {
  const fragment = document.createDocumentFragment();
  const paragraph = document.createElement("p");
  paragraph.textContent = `Total number of ${tag}s: ${tagSummary.sourcesAllNumber}`;
  fragment.appendChild(paragraph);
  if (tagSummary.sourcesAllNumber > 0) {
    if (tagSummary.sourcesValid.length === 0) {
      const blacklistedParagraph = document.createElement("p");
      blacklistedParagraph.textContent = `All ${tag}s are blacklisted`;
      fragment.appendChild(blacklistedParagraph);
    } else {
      const notBlacklistedParagraph = document.createElement("p");
      notBlacklistedParagraph.textContent = `Not blacklisted ${tag}s (${tagSummary.sourcesValid.length}):`;
      fragment.appendChild(notBlacklistedParagraph);
      fragment.appendChild(getUrlsDom(tagSummary));
    }
  }
  return fragment;
}

function getUrlsDom(tagSummary) {
  const ol = document.createElement("ol");
  ol.classList.add("detections");
  for (const [index, url] of tagSummary.sourcesValid.entries()) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("tooltip");
    const span = document.createElement("span");
    span.classList.add("tooltiptext");
    span.textContent = "Copy to clipboard";
    button.appendChild(span);
    const img = document.createElement("img");
    img.src = "/icons/copy.svg";
    button.appendChild(img);
    li.appendChild(button);
    const p = document.createElement("p");
    p.textContent = `${index + 1}.`;
    li.appendChild(p);
    const a = document.createElement("a");
    a.href = url;
    a.textContent = url;
    li.appendChild(a);
    ol.appendChild(li);
  }
  return ol;
}
