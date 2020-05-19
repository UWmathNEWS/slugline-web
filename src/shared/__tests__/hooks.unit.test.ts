import { renderHook } from "@testing-library/react-hooks";
import * as h from "../hooks";

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
