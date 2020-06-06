import makeTitle from "../makeTitle";

jest.mock("../../../config", () => ({
  title: "test",
  description: "test",
}));

describe("helpers.makeTitle", () => {
  it("returns a formatted title if provided arguments", () => {
    expect(makeTitle("test")).toBe("test | test");
  });

  it("passes on parameters to format", () => {
    expect(makeTitle("test {}", "test")).toBe("test test | test");
  });

  it("returns the default title when called without parameters or when called with an empty string", () => {
    expect(makeTitle()).toBe("test - test");
    expect(makeTitle("")).toBe("test - test");
  });
});
