import * as url from "../url";

describe("helper.url", () => {
  describe("resolve", () => {
    it("returns valid URLs verbatim", () => {
      expect(url.resolve("https://localhost:80/test")).toBe("https://localhost:80/test");
    });

    it("resolves URLs split into parts", () => {
      expect(url.resolve("https://localhost:80", "test")).toBe("https://localhost:80/test");
    });

    it("resolves dot-directories", () => {
      expect(url.resolve("https://localhost:80", "test/.././test")).toBe("https://localhost:80/test");
    });

    it("removes extraneous slashes", () => {
      expect(url.resolve("https://localhost:80/", "test//test")).toBe("https://localhost:80/test/test");
    });

    it("keeps leading and trailing slashes", () => {
      expect(url.resolve("https://localhost:80/test/")).toBe("https://localhost:80/test/");
      expect(url.resolve("https://localhost:80", "test/")).toBe("https://localhost:80/test/");
      expect(url.resolve("file:///usr/lib/")).toBe("file:///usr/lib/");
      expect(url.resolve("file:///", "usr", "lib/")).toBe("file:///usr/lib/");
    });

    it("resolves protocol-less URLs", () => {
      expect(url.resolve("/", "test")).toBe("/test");
    });

    it("resolves protocol-relative URLs", () => {
      expect(url.resolve("//localhost:80", "test")).toBe("//localhost:80/test");
    })
  });
});
