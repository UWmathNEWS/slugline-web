import { formatHref } from "../Link";

describe("formatHref", () => {
  it("adds https to URLs", () => {
    expect(formatHref("google.com")).toEqual("https://google.com");
  });

  it("doesn't add https:// when http:// or https:// already exists", () => {
    expect(formatHref("http://google.com")).toEqual("http://google.com");
    expect(formatHref("https://google.com")).toEqual("https://google.com");
  });

  it("adds mailto to emails", () => {
    expect(formatHref("bob@bob.com")).toEqual("mailto:bob@bob.com");
  });

  it("doesn't add mailto: when it already exists", () => {
    expect(formatHref("mailto:bob@bob.com")).toEqual("mailto:bob@bob.com");
  });
});
