import React from "react";
import Visor from "../Visor";
import { render, waitForDomChange } from "@testing-library/react";

jest.mock("../../../config", () => ({
  baseurl: "baseurl",
  title: "title",
  description: "description",
  themeColor: "theme-color",
  locale: "locale",
  alternateLocales: ["1", "2"],
  icons: {
    favicon: {
      src: "test",
    },
  },
  seo: {
    image: "test",
    twitter: {
      card: "test",
      ste: "test",
    },
  },
}));

describe("Visor", () => {
  it("renders Open Graph and Twitter titles without site titles", async () => {
    render(<Visor title="test" />);

    await waitForDomChange();

    expect(
      (document.querySelector("[property='og:title']") as HTMLMetaElement)
        .content
    ).toEqual("test");
    expect(
      (document.querySelector("[property='twitter:title']") as HTMLMetaElement)
        .content
    ).toEqual("test");
  });

  it("renders Open Graph and Twitter additional attributes", async () => {
    const attrs = {
      a: "a",
      b: "b",
    };

    render(
      <Visor
        seo={{
          twitter: attrs,
          og: attrs,
        }}
      />
    );

    await waitForDomChange();

    for (let [prop, value] of Object.entries(attrs)) {
      expect(
        (document.querySelector(`[property='og:${prop}']`) as HTMLMetaElement)
          .content
      ).toEqual(value);
      expect(
        (document.querySelector(
          `[property='twitter:${prop}']`
        ) as HTMLMetaElement).content
      ).toEqual(value);
    }
  });

  it("renders additional structured data", async () => {
    render(
      <Visor
        seo={{
          structuredData: {
            a: "a",
            b: { c: "c" },
          },
        }}
      />
    );

    await waitForDomChange();

    expect(
      JSON.parse(
        (document.querySelector(
          "[type='application/ld+json']"
        ) as HTMLScriptElement).text
      )
    ).toEqual({
      "@context": "https://schema.org",
      a: "a",
      b: { c: "c" },
    });
  });
});
