import axios, { AxiosError } from "axios";
import {
  Issue,
  User,
  Pagination,
  APIError,
  APIGetHook,
  UserAPIError,
  APIResponse,
  APIGetHookPaginated,
  Article,
  APIPostHook,
  RequestState,
} from "../shared/types";
import { useState, useEffect } from "react";
import ERRORS from "../shared/errors";
import { useAuth } from "../auth/AuthProvider";

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
    (err: AxiosError) => {
      throw err.response?.data.error ?? {
        detail: [ERRORS.REQUEST.DID_NOT_SUCCEED],
      };
    }
  );
};

const useApiGet = <T, U extends APIError = APIError>(
  url: string
): APIGetHook<T, U> => {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [error, setError] = useState<U | undefined>(undefined);

  useEffect(() => {
    axios.get(url).then((axiosResp) => {
      if (axiosResp.data.success) setResponse(axiosResp.data.data);
      else setError(axiosResp.data.error);
    });
  }, [url]);
  return [response, error];
};

const useApiGetPaginated = <T, U extends APIError = APIError>(
  url: string
): APIGetHookPaginated<T, U> => {
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
      page: resp ?? null,
    },
    error,
  ];
};

const useApiPost = <S, T, U extends APIError = APIError>(
  url: string
): APIPostHook<S, T, U> => {
  const auth = useAuth();

  const [state, setState] = useState<RequestState>(RequestState.NotStarted);

  let headers: { [header: string]: string } = {};
  if (auth.csrfToken) {
    headers["X-CSRFToken"] = auth.csrfToken;
  }

  const post = async (body: S): Promise<T> => {
    setState(RequestState.Started);
    const resp = await axios.post<T>(url, body, {
      headers: headers,
    });
    setState(RequestState.Complete);
    return resp.data;
  };

  return [post, state];
};

export const useLatestIssue = (): APIGetHook<Issue> => {
  return useApiGet<Issue>(getApiUrl("issues/latest/"));
};

export const useAllIssues = (): APIGetHook<Pagination<Issue>> => {
  return useApiGet<Pagination<Issue>>(getApiUrl("issues/"));
};

export const useIssue = (issueId?: number): APIGetHook<Issue> => {
  return useApiGet<Issue>(getApiUrl(`issues/${issueId}`));
};

export const useUsersList = (): APIGetHook<Pagination<User>, UserAPIError> => {
  return useApiGet<Pagination<User>, UserAPIError>(getApiUrl("users/"));
};

export const useUserArticles = (): APIGetHookPaginated<Article> => {
  return useApiGetPaginated<Article>(getApiUrl("user_articles/"));
};

export const useCreateArticle = () => {
  return useApiPost<Article, Article>(getApiUrl("articles/"));
};
