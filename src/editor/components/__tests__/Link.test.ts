import { formatHref } from "../Link";

describe("formatHref", () => {
  it("adds http to URLs", () => {
    expect(formatHref("google.com")).toEqual("http://google.com");
  });

  it("doesn't add http:// when http:// or https:// already exists", () => {
    expect(formatHref("http://google.com")).toEqual("http://google.com");
    expect(formatHref("https://google.com")).toEqual("https://google.com");
  });

  it("adds mailto to emails", () => {
    expect(formatHref("bob@bob.com")).toEqual("mailto:bob@bob.com");
    expect(
      formatHref(
        "long.obnoxious.email+someotherthing@long.obnoxious.domain123.com"
      )
    ).toEqual(
      "mailto:long.obnoxious.email+someotherthing@long.obnoxious.domain123.com"
    );
  });

  it("doesn't add mailto: to URLS that have @ in them", () => {
    expect(formatHref("some.url.com/@lookwerefancy")).toEqual(
      "http://some.url.com/@lookwerefancy"
    );
  });

  it("doesn't add mailto: when it already exists", () => {
    expect(formatHref("mailto:bob@bob.com")).toEqual("mailto:bob@bob.com");
  });
});
