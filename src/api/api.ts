import axios, { AxiosError } from "axios";
import { Issue, User, Pagination, APIError, APIResponseHook, UserAPIError, APIResponse } from "../shared/types";
import { useState, useEffect } from "react";
import ERRORS from "../shared/errors";

const API_ROOT = "/api";

export const getApiUrl = (url: string) => {
  return `${API_ROOT}/${url}`;
};

export const apiGet = <T extends any>(url: string): Promise<T | null> => {
  return axios.get<APIResponse<T>>(getApiUrl(url))
    .then((axiosResp) => {
      if (axiosResp.data.success)
        return axiosResp.data.data;
      else
        throw axiosResp.data.error;
    }, (err: AxiosError) => {
      throw err.response?.data.error ?? { detail: [ERRORS.REQUEST.DID_NOT_SUCCEED] };
    });
};

const useApiGet = <T, U extends APIError = APIError>(url: string): APIResponseHook<T, U> => {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [error, setError] = useState<U | undefined>(undefined);

  useEffect(() => {
    axios.get(getApiUrl(url))
      .then(axiosResp => {
        if (axiosResp.data.success)
          setResponse(axiosResp.data.data);
        else
          setError(axiosResp.data.error);
      });
  }, [url]);
  return [response, error];
};

// const useApiPost = <T>(url: string, data?: unknown): T | undefined => {
//   const auth = useAuth();
//   const [response, setResponse] = useState<T | undefined>(undefined);
//
//   let headers: { [header: string]: string } = {};
//   if (auth.csrfToken) {
//     headers["X-CSRFToken"] = auth.csrfToken;
//   }
//
//   useEffect(() => {
//     axios
//       .post<T>(getApiUrl(url), data, {
//         headers: headers
//       })
//       .then(axiosResp => {
//         setResponse(axiosResp.data);
//       });
//   }, [url, data, headers]);
//   return response;
// };

export const useLatestIssue = (): APIResponseHook<Issue> => {
  return useApiGet<Issue>("issues/latest/");
};

export const useAllIssues = (): APIResponseHook<Pagination<Issue>> => {
  return useApiGet<Pagination<Issue>>("issues/");
};

export const useIssue = (issueId?: number): APIResponseHook<Issue> => {
  return useApiGet<Issue>(`issues/${issueId}`);
};

export const useUsersList = (): APIResponseHook<Pagination<User>, UserAPIError> => {
  return useApiGet<Pagination<User>, UserAPIError>("users/");
};
