import { format, makeTitle } from "../helpers";

jest.mock("../../config", () => ({
  title: "title",
  description: "desc",
}));

describe("format", () => {
  it("formats unlabelled format identifiers", () => {
    expect(format("{}, {}!", "Hello", "world")).toBe("Hello, world!");
  });

  it("doesn't format strings without format syntax", () => {
    expect(format("abcdefg", "a", "b")).toBe("abcdefg");
  });

  it("returns the format string without format params", () => {
    expect(format("abc")).toBe("abc");
  });

  it("formats numeric parameters", () => {
    expect(format("{1} {0}", "a", "b")).toBe("b a");
  });

  it("formats object parameters", () => {
    expect(format("{a} {b}", { a: 1, b: 2 })).toBe("1 2");
  });

  it("formats arrays and array-like objects", () => {
    expect(format("{1} {0}", ["a", "b"])).toBe("b a");
    expect(format("{1} {0}", { 0: "a", 1: "b" })).toBe("b a");
  });

  it("preserves escaped brackets", () => {
    expect(format("{{test}}", {})).toBe("{test}");
  });

  it("substitutes undefined on non-existent parameters", () => {
    expect(format("{nonexistent}", {})).toBe("undefined");
  });
});

describe("makeTitle", () => {
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
