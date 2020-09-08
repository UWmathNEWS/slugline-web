import axios, { AxiosRequestConfig } from "axios";
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

// The following line is replaced in post-processing.
// DO NOT EDIT THE COMMENT.
export const API_ROOT = /*$ SLUGLINE_SERVER */ "/api/";

type RequestConfig = Omit<AxiosRequestConfig, "baseURL" | "validateStatus">;

const axiosRequest = async <TResp, TError extends APIError = APIError>(
  config: RequestConfig
): Promise<APIResponse<TResp, TError>> => {
  const baseConfig: AxiosRequestConfig = {
    baseURL: API_ROOT,
    validateStatus: () => true,
  };
  return axios({ ...baseConfig, ...config }).then((resp) => {
    if (typeof resp.data === "string")
      return {
        statusCode: resp.status,
        success: false,
        error: { detail: ["REQUEST.DID_NOT_SUCCEED"] },
      };

    const success = resp.status >= 200 && resp.status <= 299;
    return {
      statusCode: resp.status,
      success: success,
      ...resp.data,
    };
  });
};

export interface QueryParams {
  [key: string]: string | number;
}

/**
 * Default arguments for all requests
 */
export interface RequestArgs {
  params?: QueryParams;
  headers?: Record<string, string>;
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

export const listFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args?: RequestArgs) => {
    const config: RequestConfig = {
      url: endpoint,
      method: "GET",
      params: args?.params,
      headers: args?.headers,
    };
    const data: APIResponse<TResp, TError> = await axiosRequest(config);
    return data;
  };
};

export interface APIGetArgs extends RequestArgs {
  id: string;
}

export const getFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
) => {
  return async (args: APIGetArgs) => {
    const config: RequestConfig = {
      url: `${endpoint}${args.id}/`,
      method: "GET",
      params: args.params,
      headers: args.headers,
    };
    const data: APIResponse<TResp, TError> = await axiosRequest(config);
    return data;
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
      params: args.params,
      data: args.body,
      headers: {
        ...args.headers,
        "X-CSRFToken": args.csrf,
      },
    };
    const data: APIResponse<TResp, TError> = await axiosRequest(config);
    return data;
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
      params: args.params,
      data: args.body,
      headers: {
        ...args.headers,
        "X-CSRFToken": args.csrf,
      },
    };
    const data: APIResponse<TResp, TError> = await axiosRequest(config);
    return data;
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
      params: args.params,
      headers: {
        ...args.headers,
        "X-CSRFToken": args.csrf,
      },
    };
    const data: APIResponse<TResp, TError> = await axiosRequest(config);
    return data;
  };
};

/**
 * Unwraps a APIResponse promise into its data type, throwing the error if the request was unsuccessful
 * @param p The promise to unwrap
 */
export const unwrap = async <TResp, TError extends APIError = APIError>(
  p: Promise<APIResponse<TResp, TError>>
): Promise<TResp> => {
  const resp = await p;
  if (resp.success) {
    return resp.data;
  } else {
    throw resp.error;
  }
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
    list: listFactory<Pagination<T>, TError>(endpoint),
    get: getFactory<T, TError>(endpoint),
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
): Promise<APIResponse<void>> => {
  const config: RequestConfig = {
    url: `users/${args.username}/query/`,
    method: "GET",
    headers: args.headers,
  };
  const data = await axiosRequest<void>(config);
  return data;
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
    headers: {
      ...args.headers,
      "X-CSRFToken": args.csrf,
    },
  };
  const data = await axiosRequest<User, UserAPIError>(config);
  return data;
};

interface IssueArticlesArgs extends RequestArgs {
  id: string;
}

const issueArticles = async (
  args: IssueArticlesArgs
): Promise<APIResponse<Pagination<Article>>> => {
  const config: RequestConfig = {
    url: `issues/${args.id}/articles/`,
    method: "GET",
    headers: args.headers,
  };
  const data = await axiosRequest<Pagination<Article>>(config);
  return data;
};

const api = {
  me: {
    // this looks odd, but me/ gets with no parameters, which is equivalent to a list endpoint
    get: listFactory<User | null>("me/"),
    patch: patchMe,
  },
  login: createFactory<
    User,
    UserAPIError,
    { username: string; password: string }
  >("login/"),
  logout: createFactory<void, APIError>("logout/"),
  issues: {
    ...endpointFactory<Issue>("issues/"),
    create: createFactory<Issue, IssueAPIError>("issues/"),
    latest: listFactory<Issue, APIError>("issues/latest/"),
    articles: issueArticles,
  },
  published_issues: {
    list: listFactory<Pagination<Issue>>("published_issues/"),
    get: getFactory<Issue>("published_issues/"),
    latest: listFactory<Issue>("published_issues/latest/"),
  },
  articles: {
    ...endpointFactory<Article>("articles/"),
    create: createFactory<Article, APIError, void>("articles/"),
  },
  articleContent: {
    get: getFactory<ArticleContent>("article_content/"),
    patch: patchFactory<ArticleContent, APIError>("article_content/"),
  },
  users: {
    ...endpointFactory<User>("users/"),
    query: usernameQuery,
    create: createFactory<User, UserAPIError, ProfileFormVals>("users/"),
    patch: patchFactory<User, UserAPIError, ProfileFormVals>("users/"),
  },
};

export default api;
