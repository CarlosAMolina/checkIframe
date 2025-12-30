export function Message(info, values) {
  return { info: info, values: values };
}

export class UrlsOfType {
  constructor(type, values) {
    this.type = type;
    this.values = values;
  }
}
