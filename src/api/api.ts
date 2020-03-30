import axios from "axios";
import {
  Issue,
  User,
  Pagination,
  APIError,
  APIResponseHook,
  UserAPIError,
  APIResponseHookPaginated
} from "../shared/types";
// import { useAuth } from "../auth/AuthProvider";
import { useState, useEffect } from "react";

const API_ROOT = "/api";

export const getApiUrl = (url: string) => {
  return `${API_ROOT}/${url}`;
};

const useApiGet = <T, U extends APIError = APIError>(
  url: string
): APIResponseHook<T, U> => {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [error, setError] = useState<U | undefined>(undefined);

  useEffect(() => {
    axios.get(getApiUrl(url)).then(axiosResp => {
      if (axiosResp.data.success) setResponse(axiosResp.data.data);
      else setError(axiosResp.data.error);
    });
  }, [url]);
  return [response, error];
};

const useApiGetPaginated = <T, U extends APIError = APIError>(
  url: string
): APIResponseHookPaginated<T, U> => {
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [resp, error] = useApiGet<Pagination<T>, U>(currentUrl);

  const next = () => {
    if (resp?.next) {
      setCurrentUrl(resp.next);
    }
  };

  const previous = () => {
    if (resp?.previous) {
      setCurrentUrl(resp.previous);
    }
  };

  return [
    {
      next: resp?.next ? next : null,
      previous: resp?.previous ? previous : null,
      resp: resp ?? null
    },
    error
  ];
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

export const useUsersList = (): APIResponseHook<
  Pagination<User>,
  UserAPIError
> => {
  return useApiGet<Pagination<User>, UserAPIError>("users/");
};
