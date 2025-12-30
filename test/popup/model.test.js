import * as modelModule from "../../src/popup/model.js";

describe("Message", () => {
  it("should return info and value", function () {
    const result = modelModule.Message("foo", "bar");
    const expectedResult = { info: "foo", values: "bar" };
    expect(result).toStrictEqual(expectedResult);
  });
});
