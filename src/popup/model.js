export class Message {
  constructor(info, values) {
    this.info = info;
    if (values !== undefined) {
      this.values = values;
    }
  }
}

export class UrlsOfType {
  constructor(type, values) {
    this.type = type;
    this.values = values;
  }
}
