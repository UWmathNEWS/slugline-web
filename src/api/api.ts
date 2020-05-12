import axios, { AxiosError } from "axios";
import { APIError, APIResponse } from "../shared/types";
import ERRORS from "../shared/errors";

export const API_ROOT = "/api";

export const getApiUrl = (url: string) => {
  return `${API_ROOT}/${url}`;
};

export const apiGet = <T extends any>(url: string): Promise<T | null> => {
  return axios.get<APIResponse<T>>(url).then(
    (axiosResp) => {
      if (axiosResp.data.success) return axiosResp.data.data;
      else throw axiosResp.data.error;
    },
    (err: AxiosError<APIError>) => {
      throw err.response?.data ?? {
        detail: [ERRORS.REQUEST.DID_NOT_SUCCEED],
      };
    }
  );
};
