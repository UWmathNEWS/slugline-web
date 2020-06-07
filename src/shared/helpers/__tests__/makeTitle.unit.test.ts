import makeTitle from "../makeTitle";

jest.mock("../../../config", () => ({
  title: "title",
  description: "desc",
}));

describe("helpers.makeTitle", () => {
  it("returns a custom title if provided arguments", () => {
    expect(makeTitle("test")).toBe("test | title");
  });

  it("passes on parameters to format", () => {
    expect(makeTitle("test {}", "test")).toBe("test test | title");
  });

  it("does not format the title if no parameters are given", () => {
    expect(makeTitle("test {}")).toBe("test {} | title");
  });

  it("returns the default title when called without parameters or when called with an empty string", () => {
    expect(makeTitle()).toBe("title - desc");
    expect(makeTitle("")).toBe("title - desc");
  });
});
