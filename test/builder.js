export class HtmlBuilder {
  constructor() {
    this._html = "";
  }

  build() {
    return this._html;
  }

  with_all_blacklisted(name) {
    this._html += `\n<p>All ${name} are blacklisted</p>`;
    return this;
  }

  with_element(name) {
    this._html += `\n<p><u>${name} elements</u></p>`;
    return this;
  }

  with_not_blacklisted(name, number) {
    this._html += `\n<p>Not blacklisted ${name} (${number}):</p>`;
    return this;
  }

  with_number(name, number) {
    this._html += `\n<p>Total number of ${name}: ${number}</p>`;
    return this;
  }

  with_total(number) {
    this._html += `<p>Total number of frames and iframes: ${number}</p>`;
    return this;
  }

  with_urls(urls) {
    const li = urls
      .map(
        (url) =>
          `  <li><button class="copy-button" title="Copy to clipboard">
    copy
  </button> <a href="${url}">${url}</a></li>`,
      )
      .join("\n");
    this._html += `\n<ol>\n${li}\n</ol>`;
    return this;
  }
}
