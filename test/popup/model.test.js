import * as modelModule from "../../src/popup/model.js";

describe("Message", () => {
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
