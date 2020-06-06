import { APIResponse, APIError } from "../shared/types";
import { useState, useEffect, useCallback } from "react";
import { UnsafeRequestArgs, RequestArgs } from "./api";
import { useAuth } from "../auth/Auth";

export enum RequestState {
  /** The request has never been triggered. */
  NotStarted,
  /** The request is currently in-progress and waiting for a response. */
  Running,
  /** The request is complete and has received a successful response. */
  Complete,
}

export interface RequestInfo {
  state: RequestState;
  statusCode: number | undefined;
}

export type UseAPIHook<TResp, TError extends APIError = APIError> = [
  TResp | undefined,
  TError | undefined,
  RequestInfo
];

/**
 * Wrap a promise-based API call so that it runs immediately when the component is mounted.
 * @param fn A parameter-less async function returning an `APIResponse<TResp, TError>`. If you need this function to vary based on props,
 * wrap it in a parameter-less `useCallback` that captures the props and pass that instead.
 */
export const useAPI = <TResp, TError extends APIError = APIError>(
  fn: () => Promise<APIResponse<TResp, TError>>
): UseAPIHook<TResp, TError> => {
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.NotStarted
  );

  const [data, setData] = useState<TResp | undefined>(undefined);
  const [error, setError] = useState<TError | undefined>(undefined);
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

  useEffect(() => {
    setRequestState(RequestState.Running);
    fn().then((resp) => {
      setStatusCode(resp.statusCode);
      if (resp.success) {
        setData(resp.data);
        setError(undefined);
      } else {
        setData(undefined);
        setError(resp.error);
      }
      setRequestState(RequestState.Complete);
    });
  }, [fn]);

  return [
    data,
    error,
    {
      state: requestState,
      statusCode: statusCode,
    },
  ];
};

export type UseAPILazyHook<TResp, TArgs, TError extends APIError = APIError> = [
  (args: TArgs) => Promise<APIResponse<TResp, TError>>,
  RequestInfo
];

/**
 * Wrap a promise-based API call and return a callback to execute it. The callback returns an `APIResponse` so
 * success/failure can be determined at the call site.
 * @param fn An async function taking an object extending `SafeRequestArgs` and returning an `APIResponse<TResp, TError>`.
 */
export const useAPILazy = <
  TResp,
  TArgs extends RequestArgs,
  TError extends APIError = APIError
>(
  fn: (args: TArgs) => Promise<APIResponse<TResp, TError>>
): UseAPILazyHook<TResp, TArgs> => {
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.NotStarted
  );
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

  const exec = useCallback(
    (args: TArgs) => {
      setRequestState(RequestState.Running);
      return fn(args).then((resp) => {
        setStatusCode(resp.statusCode);
        setRequestState(RequestState.Complete);
        return resp;
      });
    },
    [fn]
  );

  return [
    exec,
    {
      state: requestState,
      statusCode: statusCode,
    },
  ];
};

export type UseAPILazyCSRFHook<
  TResp,
  TArgs extends UnsafeRequestArgs,
  TError extends APIError = APIError
> = [
  (args: Omit<TArgs, "csrf">) => Promise<APIResponse<TResp, TError>>,
  RequestInfo
];

/**
 * A variant of useAPILazy that handles the CSRF token automatically.
 * @see useApiLazy
 */
export const useAPILazyUnsafe = <
  TResp,
  TArgs extends UnsafeRequestArgs,
  TError extends APIError = APIError
>(
  fn: (args: TArgs) => Promise<APIResponse<TResp, TError>>
): UseAPILazyCSRFHook<TResp, TArgs, TError> => {
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.NotStarted
  );
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

  const auth = useAuth();

  const exec = useCallback(
    (args: Omit<TArgs, "csrf">) => {
      setRequestState(RequestState.Running);
      const argsWithCsrf = {
        ...args,
        csrf: auth.csrfToken || "",
      };
      // argsWithCsrf doesn't typecheck as TArgs, so we force the issue.
      return fn(argsWithCsrf as TArgs).then((resp) => {
        setRequestState(RequestState.Complete);
        setStatusCode(resp.statusCode);
        return resp;
      });
    },
    [fn, auth]
  );

  return [
    exec,
    {
      state: requestState,
      statusCode: statusCode,
    },
  ];
};
