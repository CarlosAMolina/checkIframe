export const URL_TYPE_BLACKLIST = "blacklist";
export const URL_TYPE_NOTIFY = "notify";
export const URL_TYPE_REFERER = "referer";

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
