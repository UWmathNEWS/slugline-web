import format from "../format";

describe("helpers.format", () => {
  it ("formats unlabelled format identifiers", () => {
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
