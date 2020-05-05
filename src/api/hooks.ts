import axios from "axios";
import {
  APIError,
  APIGetHook,
  APIGetHookPaginated,
  APIPostHook,
  RequestState,
  Issue,
  User,
  UserAPIError,
  Article,
  Pagination,
  APIResponse,
  ArticleContent,
} from "../shared/types";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import { getApiUrl } from "./api";

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

  const post = useCallback(
    async (body: S): Promise<T> => {
      let headers: { [header: string]: string } = {};
      if (auth.csrfToken) {
        headers["X-CSRFToken"] = auth.csrfToken;
      }
      setState(RequestState.Started);
      const resp = await axios.post<APIResponse<T>>(url, body, {
        headers: headers,
      });
      setState(RequestState.Complete);
      if (resp.data.success) {
        return resp.data.data;
      } else {
        throw resp.data;
      }
    },
    [url, auth.csrfToken]
  );

  return [post, state];
};

const useApiPatch = <S, T, U extends APIError = APIError>(
  url: string
): APIPostHook<S, T, U> => {
  const auth = useAuth();

  const [state, setState] = useState<RequestState>(RequestState.NotStarted);

  const patch = useCallback(
    async (body: S): Promise<T> => {
      let headers: { [header: string]: string } = {};
      if (auth.csrfToken) {
        headers["X-CSRFToken"] = auth.csrfToken;
      }
      setState(RequestState.Started);
      const resp = await axios.patch<APIResponse<T>>(url, body, {
        headers: headers,
      });
      setState(RequestState.Complete);
      if (resp.data.success) {
        return resp.data.data;
      } else {
        throw resp.data;
      }
    },
    [url, auth.csrfToken]
  );

  return [patch, state];
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

export const useCreateIssue = () => {
  return useApiPost<Issue, Issue>(getApiUrl("issues/"));
};

export const useIssueArticles = (
  issueId?: number
): APIGetHookPaginated<Article> => {
  return useApiGetPaginated<Article>(getApiUrl(`issues/${issueId}/articles/`));
};

export const useIssueList = (): APIGetHookPaginated<Issue> => {
  return useApiGetPaginated<Issue>(getApiUrl("issues/"));
};

export const useUsersList = (): APIGetHook<Pagination<User>, UserAPIError> => {
  return useApiGet<Pagination<User>, UserAPIError>(getApiUrl("users/"));
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
