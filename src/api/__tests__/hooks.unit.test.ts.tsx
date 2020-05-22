import "core-js";
import mockAxios from "jest-mock-axios";
import { renderHook, act } from "@testing-library/react-hooks";

import { getFactory, patchFactory } from "../api";
import { useAPI, RequestState, useAPILazy, useAPILazyCSRF } from "../hooks";
import {
  MOCK_RESPONSE,
  MOCK_ERROR,
  CSRF_COOKIE,
  MOCK_CSRF,
  MOCK_BODY,
} from "../../shared/test-utils";
import { AuthProvider } from "../../auth/AuthProvider";

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
  beforeEach(() => {
    document.cookie = `${CSRF_COOKIE}=${MOCK_CSRF}`;
  });

  it("doesn't make the request immediately", () => {
    const patch = patchFactory("bingo/");
    const { result } = renderHook(() => useAPILazyCSRF(patch), {
      wrapper: AuthProvider,
    });

    expect(mockAxios.lastReqGet()).toBeUndefined();
  });

  it("executes the request with a CSRF token", async () => {
    const patch = patchFactory<string>("bingo/");
    const { result } = renderHook(() => useAPILazyCSRF(patch), {
      wrapper: AuthProvider,
    });

    let [exec, info] = result.current;

    await act(async () => {
      const resp = exec({
        body: "bingo bango bongo",
        id: "15",
      });

      const req = mockAxios.lastReqGet();
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

    act(() => {
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

    expect(info.state).toBe(RequestState.Complete);
  });
});
