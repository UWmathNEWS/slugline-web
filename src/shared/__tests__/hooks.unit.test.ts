import { renderHook } from "@testing-library/react-hooks";
import * as h from "../hooks";
import { MOCK_ERROR, MOCK_RESPONSE, withStatus } from "../test-utils";
import { RequestState } from "../../api/hooks";

jest.useFakeTimers();

describe("useDebouncedCallback", () => {
  it("calls the lazy callback after the specified delay", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [lazyCallback] = result.current;

    lazyCallback();

    expect(callback).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("returns the return value of the lazy callback as a promise", async () => {
    const callback = jest.fn(() => 42);
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [lazyCallback] = result.current;

    const res = lazyCallback();

    jest.runAllTimers();

    expect(await res).toBe(42);
  });

  it("debounces the lazy callback", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [lazyCallback] = result.current;

    lazyCallback();

    jest.advanceTimersByTime(100);

    lazyCallback();

    jest.advanceTimersByTime(150);

    expect(callback).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the eager callback immediately", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [, eagerCallback] = result.current;

    eagerCallback();

    expect(callback).toHaveBeenCalled();

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("returns the return value of the eager callback immediately", () => {
    const callback = jest.fn(() => 42);
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [, eagerCallback] = result.current;

    const res = eagerCallback();

    expect(res).toBe(42);
  });

  it("cancels debounces of the lazy callback when the eager callback is called", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => h.useDebouncedCallback(callback, 200));
    const [lazyCallback, eagerCallback] = result.current;

    lazyCallback();

    jest.advanceTimersByTime(100);

    eagerCallback();

    expect(callback).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("useSSRData", () => {
  const api = jest.fn(() => Promise.resolve(withStatus(200, MOCK_RESPONSE)));

  beforeEach(() => {
    window.__SSR_DIRECTIVES__ = {};
  });

  afterEach(() => {
    api.mockClear();
  });

  it("does not make an API call when data has been provided", () => {
    window.__SSR_DIRECTIVES__.DATA = "bingo bango bongo";

    const { result } = renderHook(() => h.useSSRData(api, "bingo bango bongo"));
    const [data, info, fail] = result.current;

    expect(api).not.toHaveBeenCalled();
    expect(data).toBe("bingo bango bongo");
    expect(info.state).toBe(RequestState.NotStarted);
    expect(info.statusCode).toBeUndefined();
    expect(fail).toBeFalsy();

    expect("DATA" in window.__SSR_DIRECTIVES__).toBeFalsy();
  });

  it("makes an API call when data has not been provided", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      h.useSSRData(api, "bingo bango bongo")
    );

    expect(api).toHaveBeenCalled();

    await waitForNextUpdate();

    const [data, info, fail] = result.current;
    expect(data).toBe("bingo bango bongo");
    expect(info.state).toBe(RequestState.Complete);
    expect(info.statusCode).toBe(200);
    expect(fail).toBeFalsy();
  });

  it("uses the transformer if one is passed in", () => {
    window.__SSR_DIRECTIVES__.DATA = "bingo bango bongo";

    const transformer = () => "boo";
    const { result } = renderHook(() => h.useSSRData(api, "blep", transformer));
    const [data] = result.current;

    expect(data).toBe("boo");
  });

  it("uses the transformer if one is passed in for the API call", async () => {
    const transformer = () => "boo";
    const { result, waitForNextUpdate } = renderHook(() =>
      h.useSSRData(api, "blep", transformer)
    );

    await waitForNextUpdate();
    const [data] = result.current;

    expect(data).toBe("boo");
  });

  it("sets error on server error", () => {
    window.__SSR_DIRECTIVES__.DATA = "bingo bango bongo";
    window.__SSR_DIRECTIVES__.ERROR = "error";
    window.__SSR_DIRECTIVES__.STATUS_CODE = 400;

    const { result } = renderHook(() => h.useSSRData(api, "bad"));

    const [data, info, error] = result.current;

    expect(data).toBe("bad");
    expect(info.statusCode).toBe(400);
    expect(error).toBe("error");

    expect("STATUS_CODE" in window.__SSR_DIRECTIVES__).toBeFalsy();
  });

  it("sets failure state on client-side fetch error", async () => {
    const api = () => Promise.resolve(withStatus(400, MOCK_ERROR));
    const { result, waitForNextUpdate } = renderHook(() =>
      h.useSSRData(api, "bad")
    );

    await waitForNextUpdate();

    const [data, info, fail] = result.current;

    expect(data).toBe("bad");
    expect(fail).toEqual(MOCK_ERROR.error);
    expect(info.statusCode).toBe(400);
  });
});
