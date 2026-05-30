export class Message {
  constructor(info, values) {
    this.info = info;
    if (values !== undefined) {
      this.values = values;
    }
  }
}
