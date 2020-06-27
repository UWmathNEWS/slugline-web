import React from "react";
import Visor, { BaseVisor } from "../Visor";
import { render, waitFor } from "@testing-library/react";

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
    touchIcon: {
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
  googleSiteVerification: "abc",
}));

describe("BaseVisor", () => {
  it("uses absolute URLs for icons", async () => {
    render(<BaseVisor />);

    await waitFor(() => {
      expect(
        document.querySelector<HTMLLinkElement>("[rel='icon']")!.href
      ).toMatch(/^(\/|https?:\/\/)/);
      expect(
        document.querySelector<HTMLLinkElement>("[rel='apple-touch-icon']")!
          .href
      ).toMatch(/^(\/|https?:\/\/)/);
    });
  });

  it("renders alternate locales if defined", async () => {
    render(<BaseVisor />);

    await waitFor(() => {
      expect(
        JSON.parse(
          document.querySelector<HTMLMetaElement>(
            "[property='og:locale:alternate']"
          )!.content
        )
      ).toEqual(["1", "2"]);
    });
  });

  it("renders Google site verification if defined", async () => {
    render(<BaseVisor />);

    await waitFor(() => {
      expect(
        document.querySelector<HTMLMetaElement>(
          "[name='google-site-verification']"
        )!.content
      ).toBe("abc");
    });
  });
});

describe("Visor", () => {
  it("renders Open Graph and Twitter titles without site titles", async () => {
    render(<Visor title="test" />);

    await waitFor(() => {
      expect(
        document.querySelector<HTMLMetaElement>("[property='og:title']")!
          .content
      ).toEqual("test");
      expect(
        document.querySelector<HTMLMetaElement>("[property='twitter:title']")!
          .content
      ).toEqual("test");
    });
  });

  it("renders Open Graph and Twitter descriptions and images if provided", async () => {
    const attrs = {
      description: "a",
      image: "b",
    };

    render(<Visor seo={attrs} />);

    await waitFor(() => {
      for (let [prop, value] of Object.entries(attrs)) {
        expect(
          document.querySelector<HTMLMetaElement>(`[property='og:${prop}']`)!
            .content
        ).toEqual(value);
        expect(
          document.querySelector<HTMLMetaElement>(
            `[property='twitter:${prop}']`
          )!.content
        ).toEqual(value);
      }
    });
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

    await waitFor(() => {
      for (let [prop, value] of Object.entries(attrs)) {
        expect(
          document.querySelector<HTMLMetaElement>(`[property='og:${prop}']`)!
            .content
        ).toEqual(value);
        expect(
          document.querySelector<HTMLMetaElement>(
            `[property='twitter:${prop}']`
          )!.content
        ).toEqual(value);
      }
    });
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

    await waitFor(() => {
      expect(
        JSON.parse(
          document.querySelector<HTMLScriptElement>(
            "[type='application/ld+json']"
          )!.text
        )
      ).toEqual({
        "@context": "https://schema.org",
        a: "a",
        b: { c: "c" },
      });
    });
  });
});
