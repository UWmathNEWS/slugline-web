/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
          /* istanbul ignore else */
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

export type UseSSRDataHook<TData, TError> = [
  TData,
  RequestInfo,
  TError | undefined
];

/**
 * Wraps a promise-based API call, executing it if and only if data is not passed to it from the server. Returns the
 * desired data, the state of the request, and a flag for whether an error occurred while fetching data or not.
 *
 * This hook is meant solely for component-load data fetching, and as such does not expose entire response errors, only
 * the status code.
 *
 * @param dataMethod An async function like that passed to useAPI. Like with useAPI, if arguments need to be passed
 * to the function, it should be wrapped with useCallback.
 * @param initialData The initial data passed from the server, usually StaticRouterContextWithData.data
 * @param transformer An optional function used to transform a response. If defined at the call site, must be wrapped
 * with useCallback to prevent infinite updates.
 *
 * @example
 * useSSRData(
 *   useCallback(() => api.get({ id: propsId }), [propsId]),
 *   props.staticContext?.data || 200,
 *   useCallback((resp) => resp.statusCode, [])
 * )
 */
export const useSSRData: {
  <TData, TResp, TError extends APIError = APIError>(
    dataMethod: () => Promise<APIResponse<TResp, TError>>,
    initialData: TData | undefined,
    transformer: (resp: TResp) => TData
  ): UseSSRDataHook<TData, TError>;
  <TData, TError extends APIError = APIError>(
    dataMethod: () => Promise<APIResponse<TData, TError>>,
    initialData: TData | undefined
  ): UseSSRDataHook<TData, TError>;
} = <TData, TError>(
  dataMethod: () => any,
  initialData: any,
  transformer?: any
): any => {
  const [data, setData] = useState<TData | undefined>(initialData);
  const [getData, getDataInfo] = useAPILazy(dataMethod);
  const [respInfo, setRespInfo] = useState<RequestInfo>(getDataInfo);
  const [fail, setFail] = useState<TError | undefined>(undefined);

  // This hook MUST appear first as we update respInfo in the next useEffect
  useEffect(() => {
    setRespInfo(getDataInfo);
  }, [getDataInfo]);

  // useEffect doesn't run on the server
  useEffect(() => {
    if (window.__SSR_DIRECTIVES__.ERROR) {
      const statusCode = window.__SSR_DIRECTIVES__.STATUS_CODE;
      setRespInfo((prev) => ({
        ...prev,
        statusCode,
      }));
      setFail(window.__SSR_DIRECTIVES__.ERROR);
      delete window.__SSR_DIRECTIVES__.STATUS_CODE;
      delete window.__SSR_DIRECTIVES__.ERROR;
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
          setFail(undefined);
        } else {
          setFail(resp.error as TError);
        }
      });
    }
  }, [getData, transformer]);

  return [data, respInfo, fail];
};
