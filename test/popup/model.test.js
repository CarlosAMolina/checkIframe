import * as modelModule from "../../src/popup/model.js";

describe("Message", () => {
  it("url should have expected attributes", function () {
    const type = "notify";
    const values = ["url_1", "url_2"];
    const urls_of_type = new modelModule.UrlsOfType(type, values);
    expect(urls_of_type.type).toEqual("notify");
    expect(urls_of_type.values).toEqual(["url_1", "url_2"]);
  });
  it("should only return info", function () {
    const result = new modelModule.Message("foo");
    const expectedResult = new modelModule.Message("foo");
    expect(result).toStrictEqual(expectedResult);
  });
  it("should return info and value", function () {
    const result = new modelModule.Message("foo", "bar");
    const expectedResult = new modelModule.Message("foo", "bar");
    expect(result).toStrictEqual(expectedResult);
  });
});
