import axios from "axios";
import { Issue } from "../shared/types";
import { useAuth } from "../auth/AuthProvider";
import { useState, useEffect } from "react";

const API_ROOT = "/api";

export const getApiUrl = (url: string) => {
  return `${API_ROOT}/${url}`;
};

const useApiGet = <T>(url: string): T | undefined => {
  const [response, setResponse] = useState<T | undefined>(undefined);

  useEffect(() => {
    axios.get(getApiUrl(url)).then(axiosResp => {
      setResponse(axiosResp.data);
    });
  }, [url]);
  return response;
};

const useApiPost = <T>(url: string, data?: unknown): T | undefined => {
  const auth = useAuth();
  const [response, setResponse] = useState<T | undefined>(undefined);

  let headers: { [header: string]: string } = {};
  if (auth.csrfToken) {
    headers["X-CSRFToken"] = auth.csrfToken;
  }

  useEffect(() => {
    axios
      .post<T>(getApiUrl(url), data, {
        headers: headers
      })
      .then(axiosResp => {
        setResponse(axiosResp.data);
      });
  }, [url, data, headers]);
  return response;
};

export const useLatestIssue = (): Issue | undefined => {
  return useApiGet<Issue>("issues/latest/");
};

export const useAllIssues = (): Issue[] | undefined => {
  return useApiGet<Issue[]>("issues/");
};

export const useIssue = (issueId?: number): Issue | undefined => {
  return useApiGet<Issue>(`issues/${issueId}`);
};
