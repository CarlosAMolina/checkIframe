export class HtmlBuilder {
  constructor() {
    this._html = "";
  }

  build() {
    return this._html;
  }

  with_total(number) {
    this._html += `<p>Total number of frames and iframes: ${number}</p>`;
    return this;
  }
}
