import axios, { AxiosError } from "axios";
import { APIError, APIResponse, APIResponseFailure } from "../shared/types";
import ERRORS from "../shared/errors";

export const API_ROOT = "/api/";

export const getApiUrl = (url: string) => {
  if (!url) return API_ROOT;
  return `${API_ROOT}${url.split("/").filter(p => !!p).join("/")}/`;
};

export const apiGet = <T extends any>(url: string): Promise<T | null> => {
  return axios.get<APIResponse<T>>(getApiUrl(url)).then(
    (axiosResp) => {
      if (axiosResp.data.success) return axiosResp.data.data;
      else throw axiosResp.data.error;
    },
    (err: AxiosError<APIResponseFailure<APIError>>) => {
      throw err.response?.data.error ?? {
        status_code: err.code,
        detail: [ERRORS.REQUEST.DID_NOT_SUCCEED],
      };
    }
  );
};
