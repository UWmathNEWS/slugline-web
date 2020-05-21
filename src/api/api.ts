import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { APIResponse, APIError, Issue, Article } from "../shared/types";
import { ToastBody } from "react-bootstrap";

export const API_ROOT = "/api/";

type RequestConfig = Omit<AxiosRequestConfig, "baseURL" | "validateStatus">;

const axiosRequest = async (config: RequestConfig) => {
  const baseConfig: AxiosRequestConfig = {
    baseURL: API_ROOT,
    validateStatus: () => true,
  };
  return await axios({ ...baseConfig, ...config });
};

type APIListFn<TResp, TError extends APIError = APIError> = () => Promise<
  APIResponse<TResp, TError>
>;

export const listFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
): APIListFn<TResp, TError> => {
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

type APIGetFn<TResp, TError extends APIError = APIError> = (
  id: string
) => Promise<APIResponse<TResp, TError>>;

export const getFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
): APIGetFn<TResp, TError> => {
  return async (id: string) => {
    const config: RequestConfig = {
      url: `${endpoint}${id}/`,
      method: "GET",
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

type APIPostFn<TResp, TError extends APIError = APIError, TBody = TResp> = (
  body: TBody,
  csrf: string
) => Promise<APIResponse<TResp, TError>>;

export const postFactory = <
  TResp,
  TError extends APIError = APIError,
  TBody = TResp
>(
  endpoint: string
): APIPostFn<TResp, TError, TBody> => {
  return async (body: TBody, csrf: string) => {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: "POST",
      data: body,
      headers: {
        "X-CSRFToken": csrf,
      },
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

type APIPatchFn<TResp, TError extends APIError = APIError, TBody = TResp> = (
  id: string,
  body: Partial<TBody>,
  csrf: string
) => Promise<APIResponse<TResp, TError>>;

export const patchFactory = <
  TResp,
  TError extends APIError = APIError,
  TBody = TResp
>(
  endpoint: string
): APIPatchFn<TResp, TError, TBody> => {
  return async (id: string, body: Partial<TBody>, csrf: string) => {
    const config: AxiosRequestConfig = {
      url: `${endpoint}${id}/`,
      method: "PATCH",
      data: body,
      headers: {
        "X-CSRFToken": csrf,
      },
    };
    const resp: AxiosResponse<APIResponse<TResp, TError>> = await axiosRequest(
      config
    );
    return resp.data;
  };
};

type APIDeleteFn<TResp, TError extends APIError = APIError> = (
  id: string,
  csrf: string
) => Promise<APIResponse<TResp, TError>>;

export const deleteFactory = <TResp, TError extends APIError = APIError>(
  endpoint: string
): APIDeleteFn<TResp, TError> => {
  return async (id: string, csrf: string) => {
    const config: AxiosRequestConfig = {
      url: `${endpoint}${id}/`,
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrf,
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
  issues: endpointFactory<Issue>("issues/"),
  articles: endpointFactory<Article>("articles/"),
};

export default api;
