import HelloWorld from "../index.js";

describe("testMethod", () => {
  it("returns hello world", () => {
    expect(HelloWorld.testMethod()).toBe("hello world")
  });
});
