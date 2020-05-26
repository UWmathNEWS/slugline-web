import axios, { AxiosResponse } from "axios";
import {
  APIError,
  APIGetHook,
  APIGetHookPaginated,
  APIMutateHook,
  RequestState,
  Issue,
  User,
  UserAPIError,
  Article,
  Pagination,
  APIResponse,
  APIResponseSuccess,
  ArticleContent,
  IssueAPIError,
} from "../shared/types";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../auth/Auth";
import { getApiUrl } from "./api";
import ERRORS from "../shared/errors";

export const useApiGet = <T, U extends APIError = APIError>(
  url: string
): APIGetHook<T, U> => {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [error, setError] = useState<U | undefined>(undefined);

  useEffect(() => {
    axios.get(url).then((axiosResp: AxiosResponse<APIResponseSuccess<T>>) => {
      setResponse(axiosResp.data.data);
      setError(undefined);
    }, (axiosErr) => {
      setError(axiosErr.response?.data.error ?? {
        status_code: axiosErr.code,
        detail: [ERRORS.REQUEST.DID_NOT_SUCCEED],
      });
    });
  }, [url]);
  return [response, error];
};

export const useApiGetPaginated = <T, U extends APIError = APIError>(
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

export const useApiPost = <S, T, U extends APIError = APIError>(
  url: string
): APIMutateHook<S, T, U> => {
  const auth = useAuth();
  const csrfToken = useRef<string | null>(auth.csrfToken);

  const [state, setState] = useState<RequestState>(RequestState.NotStarted);

  // We need to use a ref to store the CSRF token; useCallback does not refresh when auth changes.
  // TODO in AuthProvider's integration test: Test that the ref updates when the token changes in a session
  useEffect(() => {
    csrfToken.current = auth.csrfToken;
  }, [auth.csrfToken]);

  const post = useCallback(
    async (body: S): Promise<APIResponse<T, U>> => {
      let headers: { [header: string]: string } = {};
      if (csrfToken.current) {
        headers["X-CSRFToken"] = csrfToken.current;
      }
      setState(RequestState.Started);
      try {
        const resp = await axios.post<APIResponse<T, U>>(url, body, {
          headers: headers
        });
        setState(RequestState.Complete);
        return resp.data;
      } catch (axiosErr) {
        setState(RequestState.Complete);
        throw axiosErr.response?.data.error ?? {
          status_code: axiosErr.code,
          detail: [ERRORS.REQUEST.DID_NOT_SUCCEED]
        };
      }
    },
    [url]
  );

  return [post, state];
};

export const useApiPatch = <S, T, U extends APIError = APIError>(
  url: string
): APIMutateHook<S, T, U> => {
  const auth = useAuth();
  const csrfToken = useRef<string | null>(auth.csrfToken);

  const [state, setState] = useState<RequestState>(RequestState.NotStarted);

  useEffect(() => {
    csrfToken.current = auth.csrfToken;
  }, [auth.csrfToken]);

  const patch = useCallback(
    async (body: S): Promise<APIResponse<T, U>> => {
      let headers: { [header: string]: string } = {};
      if (csrfToken.current) {
        headers["X-CSRFToken"] = csrfToken.current;
      }
      setState(RequestState.Started);
      try {
        const resp = await axios.patch<APIResponse<T, U>>(url, body, {
          headers: headers
        });
        setState(RequestState.Complete);
        return resp.data;
      } catch (axiosErr) {
        setState(RequestState.Complete);
        throw axiosErr.response?.data.error ?? {
          status_code: axiosErr.code,
          detail: [ERRORS.REQUEST.DID_NOT_SUCCEED]
        };
      }
    },
    [url]
  );

  return [patch, state];
};

export const useLatestIssue = (): APIGetHook<Issue> => {
  return useApiGet<Issue>(getApiUrl("issues/latest/"));
};

export const useAllIssues = (): APIGetHook<Pagination<Issue>> => {
  return useApiGet<Pagination<Issue>>(getApiUrl("issues/"));
};

export const useIssue = (issueId?: string): APIGetHook<Issue> => {
  return useApiGet<Issue>(getApiUrl(`issues/${issueId}`));
};

export const useCreateIssue = () => {
  return useApiPost<Issue, Issue, IssueAPIError>(getApiUrl("issues/"));
};

export const useIssueArticles = (
  issueId?: string
): APIGetHookPaginated<Article> => {
  return useApiGetPaginated<Article>(getApiUrl(`issues/${issueId}/articles/`));
};

export const useIssueList = (): APIGetHookPaginated<Issue> => {
  return useApiGetPaginated<Issue>(getApiUrl("issues/"));
};

export const useUsersList = (): APIGetHookPaginated<User, UserAPIError> => {
  return useApiGetPaginated<User, UserAPIError>(getApiUrl("users/"));
};

export const useUserArticles = (): APIGetHookPaginated<Article> => {
  return useApiGetPaginated<Article>(getApiUrl("user_articles/"));
};

export const useCreateArticle = () => {
  return useApiPost<void, Article>(getApiUrl("articles/"));
};

export const useArticle = (id: number) => {
  return useApiGet<Article>(getApiUrl(`articles/${id}/`));
};

export const useUpdateArticle = (id: number) => {
  return useApiPatch<Partial<Article>, Article>(getApiUrl(`articles/${id}/`));
};

export const useArticleContent = (id: number) => {
  return useApiGet<ArticleContent>(getApiUrl(`article_content/${id}/`));
};

export const useUpdateArticleContent = (id: number) => {
  return useApiPatch<ArticleContent, ArticleContent>(
    getApiUrl(`article_content/${id}/`)
  );
};
