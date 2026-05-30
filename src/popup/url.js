// TODO sometimes it is called once and an inner function calls it again,
// TODO review the code to reduce the calls to this method.
export function getUrlTypeActive() {
  const idTypeMap = [
    { idHtml: "buttonUrlsBlacklist", urlType: URL_TYPE_BLACKLIST },
    { idHtml: "buttonUrlsNotify", urlType: URL_TYPE_NOTIFY },
    { idHtml: "buttonUrlsReferer", urlType: URL_TYPE_REFERER },
  ];
  for (let i = 0; i < idTypeMap.length; i++) {
    const { idHtml, urlType } = idTypeMap[i];
    if (document.getElementById(idHtml).checked) {
      return urlType;
    }
  }
  return null;
}
