import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  APIResponse,
  APIError,
  Issue,
  Article,
  User,
  UserAPIError,
} from "../shared/types";

export const API_ROOT = "/api/";

type RequestConfig = Omit<AxiosRequestConfig, "baseURL" | "validateStatus">;

const axiosRequest = async (config: RequestConfig) => {
  const baseConfig: AxiosRequestConfig = {
    baseURL: API_ROOT,
    validateStatus: () => true,
  };
  return await axios({ ...baseConfig, ...config });
};

/**
 * Any API call that needs a CSRF token, i.e., "unsafe" methods like POST, DELETE, etc.,
 * should have an args object that extends this interface.
 * This allows `useAPILazyCSRF` to automatically handle the token.
 * @see useAPILazyCSRF
 */
export interface UnsafeRequestArgs {
  csrf: string;
}

export const listFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async () => {
    const config: RequestConfig = {
      url: endpoint,
      method: "GET",
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

export interface APIGetArgs {
  id: string;
}

export const getFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args: APIGetArgs) => {
    const config: RequestConfig = {
      url: `${endpoint}${args.id}/`,
      method: "GET",
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

export interface APIPostArgs<TBody> extends UnsafeRequestArgs {
  body: TBody;
}

export const postFactory = <
  TResp,
  TError extends APIError = APIError,
  TBody = TResp
>(
  endpoint: string
) => {
  return async (args: APIPostArgs<TBody>) => {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: "POST",
      data: args.body,
      headers: {
        "X-CSRFToken": args.csrf,
      },
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

interface APIPatchArgs<TBody> extends UnsafeRequestArgs {
  id: string;
  body: Partial<TBody>;
}

export const patchFactory = <
  TResp,
  TError extends APIError = APIError,
  TBody = TResp
>(
  endpoint: string
) => {
  return async (args: APIPatchArgs<TBody>) => {
    const config: AxiosRequestConfig = {
      url: `${endpoint}${args.id}/`,
      method: "PATCH",
      data: args.body,
      headers: {
        "X-CSRFToken": args.csrf,
      },
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

interface APIDeleteArgs extends UnsafeRequestArgs {
  id: string;
}

export const deleteFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args: APIDeleteArgs) => {
    const config: AxiosRequestConfig = {
      url: `${endpoint}${args.id}/`,
      method: "DELETE",
      headers: {
        "X-CSRFToken": args.csrf,
      },
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

/**
 * A basic, all-defaults endpoint factory that assumes all API methods
 * have the same response/body types and all return the same error type.
 * @param endpoint The endpoint url, ending in a slash
 */
export const endpointFactory = <T, TError extends APIError = APIError>(
  endpoint: string
) => {
  return {
    list: listFactory<T, TError>(endpoint),
    get: getFactory<T, TError>(endpoint),
    post: postFactory<T, TError>(endpoint),
    patch: patchFactory<T, TError>(endpoint),
    delete: deleteFactory<T, TError>(endpoint),
  };
};

const api = {
  me: listFactory<User | null>("me/"),
  login: postFactory<
    User,
    UserAPIError,
    { username: string; password: string }
  >("login/"),
  logout: postFactory<void, APIError, void>("logout/"),
  issues: endpointFactory<Issue>("issues/"),
  articles: endpointFactory<Article>("articles/"),
};

export default api;
