import * as modelModule from "../../src/popup/model.js";

describe("Message", () => {
  it("should only return info", function () {
    const result = modelModule.Message("foo");
    const expectedResult = { info: "foo" };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should return info and value", function () {
    const result = modelModule.Message("foo", "bar");
    const expectedResult = { info: "foo", values: "bar" };
    expect(result).toStrictEqual(expectedResult);
  });
});
