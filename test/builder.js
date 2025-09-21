export class HtmlBuilder {
  constructor() {
    this._html = "";
  }

  build() {
    return this._html;
  }

  with_element(name) {
    this._html += `\n<p><u>${name} elements</u></p>`;
    return this;
  }

  with_element_not_blacklisted_(name, number) {
    this._html += `\n<p>Not blacklisted ${name} (${number}):</p>`;
    return this;
  }

  with_element_not_blacklisted(name) {
    this._html += `\n<p>All ${name} are blacklisted</p>`;
    return this;
  }

  with_element_number(name, number) {
    this._html += `\n<p>Total number of ${name}: ${number}</p>`;
    return this;
  }

  with_total(number) {
    this._html += `<p>Total number of frames and iframes: ${number}</p>`;
    return this;
  }
}
