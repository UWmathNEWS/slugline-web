import "core-js";
import mockAxios from "jest-mock-axios";
import { renderHook, act } from "@testing-library/react-hooks";

import { getFactory, patchFactory } from "../api";
import { useAPI, RequestState, useAPILazy, useAPILazyCSRF } from "../hooks";
import {
  MOCK_RESPONSE,
  MOCK_ERROR,
  MOCK_CSRF,
  MOCK_BODY,
  testUser,
} from "../../shared/test-utils";
import { AuthProvider } from "../../auth/AuthProvider";
import { APIResponse } from "../../shared/types";
import { CSRF_COOKIE } from "../../auth/Auth";

describe("useAPI", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("makes the API call immediately", () => {
    const get = getFactory<string>("bingo/");
    const fn = () => get({ id: "15" });
    renderHook(() => useAPI<string>(fn));

    expect(mockAxios.lastReqGet().url).toBe("bingo/15/");
  });

  it("returns the correct data", async () => {
    const get = getFactory<string>("bingo/");
    const fn = () => get({ id: "15" });
    const { result } = renderHook(() => useAPI(fn));

    let [resp, error, info] = result.current;
    expect(resp).toBeUndefined();
    expect(error).toBeUndefined();

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
    });

    [resp, error, info] = result.current;

    expect(resp).toEqual(MOCK_RESPONSE.data);
    expect(error).toBeUndefined();
  });

  it("returns the correct error", async () => {
    const get = getFactory<string>("bingo/");
    const fn = () => get({ id: "15" });
    const { result } = renderHook(() => useAPI(fn));

    let [resp, error, info] = result.current;
    expect(resp).toBeUndefined();
    expect(error).toBeUndefined();

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_ERROR,
        }
      );
    });

    [resp, error, info] = result.current;

    expect(resp).toBeUndefined();
    expect(error).toEqual(MOCK_ERROR.error);
  });

  it("correctly updates RequestState", async () => {
    const get = getFactory<string>("bingo/");
    const fn = () => get({ id: "15" });
    const { result } = renderHook(() => useAPI(fn));

    let [resp, error, info] = result.current;
    expect(info.state).toBe(RequestState.Running);

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
    });

    [resp, error, info] = result.current;
    expect(info.state).toBe(RequestState.Complete);
  });

  it("correctly updates return value on multiple fetches", async () => {
    const get = getFactory<string>("bingo/");
    const { result, rerender } = renderHook(({ fn }) => useAPI(fn), {
      initialProps: {
        fn: () => get({ id: "15" }),
      },
    });

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_ERROR,
        }
      );
    });

    let [resp, error] = result.current;

    expect(resp).toBeUndefined();
    expect(error).toEqual(MOCK_ERROR.error);

    // create a new function to get the hook to re run the request
    const fn2 = () => get({ id: "15" });
    rerender({ fn: fn2 });

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
    });

    [resp, error] = result.current;

    expect(resp).toEqual(MOCK_RESPONSE.data);
    expect(error).toBeUndefined();
  });
});

describe("useAPILazy", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("doesn't make the request immediately", () => {
    const get = getFactory<string>("bingo/");

    const { result } = renderHook(() => useAPILazy(get));

    expect(mockAxios.lastReqGet()).toBeUndefined();
  });

  it("executes the request when the callback is called", async () => {
    const get = getFactory<string>("bingo/");

    const { result } = renderHook(() => useAPILazy(get));

    let [exec, info] = result.current;

    await act(async () => {
      const resp = exec({ id: "15" });
      expect(mockAxios.lastReqGet().url).toEqual("bingo/15/");

      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
      expect(await resp).toEqual(MOCK_RESPONSE);
    });
  });

  it("correctly updates RequestState", async () => {
    const get = getFactory<string>("bingo/");

    const { result } = renderHook(() => useAPILazy(get));

    let [exec, info] = result.current;
    expect(info.state).toBe(RequestState.NotStarted);

    act(() => {
      exec({ id: "15" });
    });

    [exec, info] = result.current;
    expect(info.state).toBe(RequestState.Running);

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
    });

    [exec, info] = result.current;
    expect(info.state).toBe(RequestState.Complete);
  });
});

describe("useAPILazyCSRF", () => {
  beforeAll(() => {
    window.document.cookie = `${CSRF_COOKIE}=${MOCK_CSRF}`;
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("doesn't make the request immediately", () => {
    const patch = patchFactory("bingo/");
    const { result } = renderHook(() => useAPILazyCSRF(patch), {
      wrapper: AuthProvider,
    });

    // The auth provider will make a get request on its own so we need to dodge that here
    expect(mockAxios.getReqMatching({ method: "PATCH" })).toBeUndefined();
  });

  it("executes the request with a CSRF token", async () => {
    const patch = patchFactory<string>("bingo/");
    const { result } = renderHook(() => useAPILazyCSRF(patch), {
      wrapper: AuthProvider,
    });

    // get the AuthProvider to trigger first
    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "GET",
          url: "me/",
        },
        {
          data: {
            success: true,
            data: testUser,
          },
        }
      );
    });

    let [exec, info] = result.current;

    await act(async () => {
      const resp = exec({
        body: "bingo bango bongo",
        id: "15",
      });

      const req = mockAxios.getReqMatching({ method: "PATCH" });
      expect(req.url).toEqual("bingo/15/");
      expect(req.data).toEqual("bingo bango bongo");
      expect(req.config.headers["X-CSRFToken"]).toEqual(MOCK_CSRF);
    });
  });

  it("correctly updates RequestState", async () => {
    const patch = patchFactory<string>("bingo/");
    const { result } = renderHook(() => useAPILazyCSRF(patch), {
      wrapper: AuthProvider,
    });

    let [exec, info] = result.current;
    expect(info.state).toBe(RequestState.NotStarted);

    let resp: Promise<APIResponse<string>>;

    await act(async () => {
      exec({ id: "15", body: "bingo bango bongo" });
    });

    [exec, info] = result.current;
    expect(info.state).toBe(RequestState.Running);

    await act(async () => {
      mockAxios.mockResponseFor(
        {
          method: "PATCH",
          url: "bingo/15/",
        },
        {
          data: MOCK_RESPONSE,
        }
      );
    });

    [exec, info] = result.current;
    expect(info.state).toBe(RequestState.Complete);
  });
});
