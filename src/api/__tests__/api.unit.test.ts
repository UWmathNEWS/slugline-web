import "core-js";
import mockAxios from "jest-mock-axios";
import { API_ROOT, getApiUrl, apiGet } from "../api";
import ERRORS from "../../shared/errors";

describe("getApiUrl", () => {
  it("returns root endpoint on empty string", () => {
    expect(getApiUrl("")).toBe(API_ROOT);
  });

  it("returns correct endpoint on an endpoint", () => {
    expect(getApiUrl("test/")).toBe(API_ROOT + "test/");
  });

  it("removes extraneous slashes", () => {
    expect(getApiUrl("/test/")).toBe(API_ROOT + "test/");
    expect(getApiUrl("test//")).toBe(API_ROOT + "test/");
    expect(getApiUrl("test//test/")).toBe(API_ROOT + "test/test/");
    expect(getApiUrl("/test///test//")).toBe(API_ROOT + "test/test/");
  });

  it("always appends a trailing slash", () => {
    expect(getApiUrl("test")).toBe(API_ROOT + "test/");
  });
});

describe("getApi", () => {
  let resp: Promise<any>;

  beforeEach(() => {
    resp = apiGet("test/")
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("handles responses (sanity check)", () => {
    expect(mockAxios.get).toHaveBeenCalledWith(getApiUrl("test/"));
  });

  it("handles successful responses", async () => {
    mockAxios.mockResponse({ data: { success: true, data: 1000 } });
    const data = await resp;

    expect(data).toBe(1000);
  });

  it("handles successful null responses", async () => {
    mockAxios.mockResponse({ data: { success: true, data: null } });
    const data = await resp;

    expect(data).toBeNull();
  });

  it("handles unsuccessful responses with a specific error message", async () => {
    mockAxios.mockError({
      code: 500,
      response: {
        data: {
          success: false,
          error: {
            status_code: 500,
            detail: ["Error thrown in testing"]
          }
        }
      }
    });

    try {
      await resp;
      expect("Error was not thrown by getApi").toBe(false);
    } catch (e) {
      expect(e).toEqual({
        status_code: 500,
        detail: ["Error thrown in testing"]
      });
    }
  });

  it("handles unsuccessful responses without a specific error message", async () => {
    mockAxios.mockError({
      code: 500,
      response: {
        data: "SERVER-SIDE ERROR"
      }
    });

    try {
      await resp;
      expect("Error was not thrown by getApi").toBe(false);
    } catch (e) {
      expect(e).toEqual({
        status_code: 500,
        detail: [ERRORS.REQUEST.DID_NOT_SUCCEED]
      });
    }
  });
});
