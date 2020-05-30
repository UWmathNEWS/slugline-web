import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  APIResponse,
  APIError,
  Issue,
  Article,
  User,
  UserAPIError,
  IssueAPIError,
  Pagination,
  ArticleContent,
} from "../shared/types";
import { ProfileFormVals } from "../profile/ProfileForm";

export const API_ROOT = "/api/";

type RequestConfig = Omit<AxiosRequestConfig, "baseURL" | "validateStatus">;

const axiosRequest = async (config: RequestConfig) => {
  const baseConfig: AxiosRequestConfig = {
    baseURL: API_ROOT,
    validateStatus: () => true,
  };
  return await axios({ ...baseConfig, ...config });
};

export interface QueryParams {
  [key: string]: string | number;
}

/**
 * Default arguments for all requests
 */
export interface RequestArgs {
  params?: QueryParams;
  throw?: boolean;
}

/**
 * Any API call that needs a CSRF token, i.e., "unsafe" methods like POST, DELETE, etc.,
 * should have an args object that extends this interface.
 * This allows `useAPILazyCSRF` to automatically handle the token.
 * @see useAPILazyCSRF
 */
export interface UnsafeRequestArgs extends RequestArgs {
  csrf: string;
}

export const getFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args?: RequestArgs) => {
    const config: RequestConfig = {
      url: endpoint,
      method: "GET",
      params: args?.params || undefined,
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    if (args?.throw && resp.data.success === false) {
      throw resp.data.error;
    }
    return resp.data;
  };
};

export interface APIGetArgs extends RequestArgs {
  id: string;
}

export const retrieveFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args: APIGetArgs) => {
    const config: RequestConfig = {
      url: `${endpoint}${args.id}/`,
      method: "GET",
      params: args.params || undefined,
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

export const createFactory = <
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
      params: args.params || undefined,
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
      params: args.params || undefined,
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
      params: args.params || undefined,
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
    get: getFactory<T, TError>(endpoint),
    retrieve: retrieveFactory<T, TError>(endpoint),
    create: createFactory<T, TError>(endpoint),
    patch: patchFactory<T, TError>(endpoint),
    delete: deleteFactory<T, TError>(endpoint),
  };
};

interface UserQueryArgs extends RequestArgs {
  username: string;
}

const usernameQuery = async (
  args: UserQueryArgs
): Promise<APIResponse<void, APIError>> => {
  const config: RequestConfig = {
    url: `users/${args.username}/query/`,
    method: "GET",
    params: args.params,
  };
  const resp = await axiosRequest(config);
  return resp.data;
};

interface PatchMeArgs extends UnsafeRequestArgs {
  body: ProfileFormVals;
}

const patchMe = async (
  args: PatchMeArgs
): Promise<APIResponse<User, UserAPIError>> => {
  const config: RequestConfig = {
    url: "me/",
    method: "PATCH",
    data: args.body,
    params: args.params,
    headers: {
      "X-CSRFToken": args.csrf,
    },
  };
  const resp = await axiosRequest(config);
  return resp.data;
};

const api = {
  me: {
    get: getFactory<User | null>("me/"),
    patch: patchMe,
  },
  login: createFactory<
    User,
    UserAPIError,
    { username: string; password: string }
  >("login/"),
  logout: createFactory<void, APIError, void>("logout/"),
  issues: {
    ...endpointFactory<Issue>("issues/"),
    get: getFactory<Pagination<Issue>>("issues/"),
    create: createFactory<Issue, IssueAPIError, Issue>("issues/"),
    latest: getFactory<Issue, APIError>("issues/latest/"),
  },
  articles: {
    ...endpointFactory<Article>("articles/"),
    create: createFactory<Article, APIError, void>("articles/"),
  },
  articleContent: {
    retrieve: retrieveFactory<ArticleContent>("article_content/"),
    patch: patchFactory<ArticleContent, APIError, ArticleContent>(
      "article_content/"
    ),
  },
  users: {
    ...endpointFactory<User>("users/"),
    query: usernameQuery,
    create: createFactory<User, UserAPIError, ProfileFormVals>("users/"),
    patch: patchFactory<User, UserAPIError, ProfileFormVals>("users/"),
  },
};

export default api;
