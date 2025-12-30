export function Message(info, values) {
  const result = { info: info };
  if (values === undefined) {
    return result;
  }
  result.values = values;
  return result;
}

export class UrlsOfType {
  constructor(type, values) {
    this.type = type;
    this.values = values;
  }
}
