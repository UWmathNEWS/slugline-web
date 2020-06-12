import { useCallback, useEffect, useRef, useState } from "react";
import { APIError, APIResponse } from "./types";
import { RequestInfo, useAPILazy } from "../api/hooks";

// taken from https://stackoverflow.com/questions/56283920/how-to-debounce-a-callback-in-functional-component-using-hooks
// with minor modifications
export const useDebouncedCallback = <A extends any[], R>(
  callback: (...args: A) => R | Promise<R>,
  wait: number
) => {
  // track args & timeout handle between calls
  const argsRef = useRef<A>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const cleanup = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, []);

  const callbackWithDebounce = useCallback(
    (...args: A) => {
      return new Promise<R>((resolve) => {
        // capture latest args
        argsRef.current = args;

        // clear debounce timer
        cleanup();

        // start waiting again
        timeout.current = setTimeout(() => {
          if (argsRef.current) {
            resolve(callback(...argsRef.current));
          }
        }, wait);
      });
    },
    [callback, wait]
  );

  const callbackWithoutDebounce = useCallback(
    (...args: A) => {
      cleanup();

      return callback(...args);
    },
    [callback]
  );

  return [callbackWithDebounce, callbackWithoutDebounce];
};

/**
 * Wraps a promise-based API call, executing it if and only if data is not passed to it from the server. Returns the
 * desired data, the state of the request, and a flag for whether an error occurred while fetching data or not.
 *
 * @param dataMethod An async function like that passed to useAPI. Like with useAPI, if arguments need to be passed
 * to the function, it should be wrapped with useCallback.
 * @param transformer An optional function used to transform a response. If defined at the call site, must be wrapped
 * with useCallback to prevent infinite updates.
 * @param initialData The initial data passed from the server, usually StaticRouterContextWithData.data
 *
 * @example
 * useSSRData(
 *   useCallback(() => api.get({ id: propsId }), [propsId]),
 *   useCallback((resp) => resp.statusCode, []),
 *   props.staticContext.data || 200
 * )
 */
type UseSSRDataHook<TData> = [TData, RequestInfo, boolean];

export const useSSRData: {
  <TData, TResp, TError extends APIError = APIError>(
    dataMethod: () => Promise<APIResponse<TResp, TError>>,
    transformer: (resp: TResp) => TData,
    initialData: TData | undefined
  ): UseSSRDataHook<TData>;
  <TData, TError extends APIError = APIError>(
    dataMethod: () => Promise<APIResponse<TData, TError>>,
    initialData: TData | undefined
  ): UseSSRDataHook<TData>;
} = <TData, TResp, TArgs, TError>(
  dataMethod: (args?: any) => any,
  transformer: any,
  initialData?: any
): any => {
  // normalize params
  if (typeof transformer !== "function") {
    initialData = transformer;
    transformer = undefined;
  }

  const [data, setData] = useState<TData | undefined>(initialData);
  const [getData, getDataInfo] = useAPILazy(dataMethod);
  const [respInfo, setRespInfo] = useState<RequestInfo>(getDataInfo);
  const [fail, setFail] = useState(false);

  // useEffect doesn't run on the server
  useEffect(() => {
    if (window.__SSR_DIRECTIVES__.STATUS_CODE) {
      const statusCode = window.__SSR_DIRECTIVES__.STATUS_CODE;
      setRespInfo((prev) => ({
        ...prev,
        statusCode,
      }));
      setFail(true);
      delete window.__SSR_DIRECTIVES__.STATUS_CODE;
      return;
    }

    if (window.__SSR_DIRECTIVES__.DATA) {
      setData(
        transformer
          ? transformer(window.__SSR_DIRECTIVES__.DATA)
          : window.__SSR_DIRECTIVES__.DATA
      );
      delete window.__SSR_DIRECTIVES__.DATA;
    } else {
      getData().then((resp) => {
        if (resp.success) {
          setData(transformer ? transformer(resp.data) : resp.data);
          setFail(false);
        } else {
          setFail(true);
        }
      });
    }
  }, [getData, transformer]);

  useEffect(() => {
    setRespInfo(getDataInfo);
  }, [getDataInfo]);

  return [data, respInfo, fail];
};
