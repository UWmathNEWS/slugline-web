import "core-js";
import mockAxios from "jest-mock-axios";
import * as h from "../hooks";
import { renderHook, act } from "@testing-library/react-hooks";
import { RequestState } from "../../shared/types";
import { CSRF_COOKIE, testUser, makeTestError } from "../../shared/test-utils";

import { AuthProvider } from "../../auth/AuthProvider";
import ERRORS from "../../shared/errors";

describe("useApiGet", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("calls axios.get (sanity check)", () => {
    const { result } = renderHook(() => h.useApiGet("test"));

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get.mock.calls[0][0]).toBe("test");

    const [resp, err] = result.current;

    expect(resp).toBeUndefined();
    expect(err).toBeUndefined();
  });

  it("handles successful responses", () => {
    const { result } = renderHook(() => h.useApiGet("test"));

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: "Success" } })
    });

    const [resp, err] = result.current;

    expect(resp).toBe("Success");
    expect(err).toBeUndefined();
  });

  it("handles successful responses with null data", () => {
    const { result } = renderHook(() => h.useApiGet("test"));

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: null } })
    });

    const [resp, err] = result.current;

    expect(resp).toBe(null);
    expect(err).toBeUndefined();
  });

  it("returns an error on an unsuccessful response", () => {
    const { result } = renderHook(() => h.useApiGet("test"));

    act(() => {
      mockAxios.mockError(makeTestError(500, "Error thrown in testing"));
    });

    const [resp, err] = result.current;

    expect(resp).toBeUndefined();
    expect(err).toBe("Error thrown in testing");
  });

  it("returns a generic error message on an unsuccessful response without a specific error message", async () => {
    const { result } = renderHook(() => h.useApiGet("test"));

    act(() => {
      mockAxios.mockError(makeTestError(500, null));
    });

    const [resp, err] = result.current;

    expect(resp).toBeUndefined();
    expect(err).toEqual({
      status_code: 500,
      detail: [ERRORS.REQUEST.DID_NOT_SUCCEED]
    });
  });
});

describe("useApiGetPaginated", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("calls axios.get (sanity check)", () => {
    renderHook(() => h.useApiGetPaginated("test"));

    expect(mockAxios.get.mock.calls[0][0]).toBe("test");
  });

  it("returns an object with null values when request is not ready", () => {
    const { result } = renderHook(() => h.useApiGetPaginated("test"));

    const [{ next, previous, page }, err] = result.current;

    expect(next).toBeNull();
    expect(previous).toBeNull();
    expect(page).toBeNull();
    expect(err).toBeUndefined();
  });

  it("returns pagination functions that paginate to next/previous page", async () => {
    const { result } = renderHook(() => h.useApiGetPaginated("test"));
    const data = {
      count: 20,
      page: 2,
      num_pages: 2,
      next: "test1",
      previous: "test2",
      results: []
    };

    act(() => {
      mockAxios.mockResponse({
        data: {
          success: true,
          data
        }
      });
    });

    const [resp1, err1] = result.current;
    expect(resp1.next).not.toBeNull();
    expect(resp1.previous).not.toBeNull();
    expect(resp1.page).toEqual(data);
    expect(err1).toBeUndefined();

    act(() => {
      resp1.next!();
    });

    expect(mockAxios.get.mock.calls[1][0]).toBe("test1");

    act(() => {
      mockAxios.mockResponse({
        data: {
          success: true,
          data
        }
      });
    });

    const [resp2, err2] = result.current;
    expect(resp2.next).not.toBeNull();
    expect(resp2.previous).not.toBeNull();
    expect(resp2.page).toEqual(data);
    expect(err2).toBeUndefined();

    act(() => {
      resp2.previous!();
    });

    expect(mockAxios.get.mock.calls[2][0]).toBe("test2");
  });

  it("returns a null next paginator if next page does not exist", () => {
    const { result } = renderHook(() => h.useApiGetPaginated("test"));
    const data = {
      count: 20,
      page: 2,
      num_pages: 2,
      next: null,
      previous: "test",
      results: []
    };

    act(() => {
      mockAxios.mockResponse({
        data: {
          success: true,
          data
        }
      });
    });

    const [{ next, previous }] = result.current;

    expect(next).toBeNull();
    expect(typeof previous).toBe("function");
  });

  it("returns a null previous paginator if previous page does not exist", () => {
    const { result } = renderHook(() => h.useApiGetPaginated("test"));
    const data = {
      count: 20,
      page: 2,
      num_pages: 2,
      next: "test",
      previous: null,
      results: []
    };

    act(() => {
      mockAxios.mockResponse({
        data: {
          success: true,
          data
        }
      });
    });

    const [{ next, previous }] = result.current;

    expect(typeof next).toBe("function");
    expect(previous).toBeNull();
  });

  it("does not crash on an error", () => {
    const { result } = renderHook(() => h.useApiGetPaginated("test"));

    act(() => {
      mockAxios.mockError(makeTestError(500, "Error thrown in testing"));
    });

    const [, err] = result.current;

    expect(err).not.toBeUndefined();
  });
});

describe("useApiPost", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("returns a callback and does not immediately call axios.post (sanity check)", () => {
    const { result } = renderHook(() => h.useApiPost("test"), { wrapper: AuthProvider });

    const [post, state] = result.current;

    expect(typeof post).toBe("function");
    expect(post.length).toBe(1);
    expect(state).toBe(RequestState.NotStarted);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  describe("calling the returned callback", () => {
    let result: any;
    let dataPromise: any;

    beforeAll(() => {
      window.document.cookie = `${CSRF_COOKIE}=csrf`;
    });

    beforeEach(() => {
      console.log("------------------");
      result = renderHook(() => h.useApiPost("test"), { wrapper: AuthProvider }).result;
      const [post] = result.current;

      act(() => {
        mockAxios.mockResponse({
          data: { success: true, data: testUser }
        });
      });

      act(() => {
        dataPromise = post("test post");
      });
    });

    afterEach(() => {
      mockAxios.reset();
      localStorage.clear();
    });

    afterAll(() => {
      delete window.document.cookie;
    });

    it("calls axios.post", () => {
      expect(mockAxios.post).toHaveBeenCalled();

      const postReq = mockAxios.lastReqGet();

      expect(postReq.url).toBe("test");
      expect(postReq.data).toBe("test post");
    });

    it("sends a CSRF token along with the request", () => {
      expect(mockAxios.lastReqGet().config.headers).toEqual({
        "X-CSRFToken": "csrf"
      });
    });

    it("returns correct state and response data", async () => {
      const data = { success: "true", data: "data" };
      let [, state] = result.current;

      expect(state).toBe(RequestState.Started);

      act(() => {
        mockAxios.mockResponse({ data });
      });

      await act(async () => {
        const respData = await dataPromise;
        [, state] = result.current;

        expect(state).toBe(RequestState.Complete);
        expect(respData).toBe(data);
      });
    });
  });

  it("returns an error on an unsuccessful response", async () => {
    const { result } = renderHook(() => h.useApiPost("test"), { wrapper: AuthProvider });
    act(() => {
      mockAxios.mockResponse({
        data: { success: true, data: testUser }
      });
    });

    const [post] = result.current;
    let dataPromise: any;

    act(() => {
      dataPromise = post("test data");
    });

    act(() => {
      mockAxios.mockError(makeTestError(500, "Error thrown in testing"));
    });

    await act(async () => {
      try {
        await dataPromise;
        expect("Error was not thrown by useApiPost").toBe(false);
      } catch (e) {
        expect(e).toBe("Error thrown in testing");
      }
    });
  });

  it("returns a generic error message on an unsuccessful response without a specific error message", async () => {
    const { result } = renderHook(() => h.useApiPost("test"), { wrapper: AuthProvider });
    act(() => {
      mockAxios.mockResponse({
        data: { success: true, data: testUser }
      });
    });

    const [post] = result.current;
    let dataPromise: any;

    act(() => {
      dataPromise = post("test data");
    });

    act(() => {
      mockAxios.mockError(makeTestError(500, null));
    });

    await act(async () => {
      try {
        await dataPromise;
        expect("Error was not thrown by useApiPost").toBe(false);
      } catch (e) {
        expect(e).toEqual({
          status_code: 500,
          detail: [ERRORS.REQUEST.DID_NOT_SUCCEED]
        });
      }
    });
  });
});
