import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

import {
  User,
  UserAPIResponse,
  APIResponse,
} from "../shared/types";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method as AxiosMethod,
} from "axios";
import { apiGet, getApiUrl } from "../api/api";
import ERRORS from "../shared/errors";
import { authReducer, USER_LOCALSTORAGE_KEY, Auth } from "./Auth";

interface AxiosConfig extends AxiosRequestConfig {
  method: AxiosMethod;
  url: string;
}

export const AuthProvider: React.FC = (props) => {
  const storedUser = localStorage.getItem(USER_LOCALSTORAGE_KEY);
  const readyPromise = useRef<Promise<void> | undefined>(undefined);
  const isWaiting = useRef<boolean>(false);
  const [user, dispatchUser] = useReducer(
    authReducer,
    {
      user: storedUser !== null ? JSON.parse(storedUser) : null,
      csrfToken: null, // null is a sentinel value here so we know the page was just loaded
    }
  );

  const check = (force: boolean = false) => {
    if (!isWaiting.current && (force || readyPromise.current === undefined)) {
      isWaiting.current = true;
      const promise = (
        apiGet<User | null>(getApiUrl("me/"))
      ).then((data: User | null) => {
        if (user.csrfToken === null || force) {
          if (data) {
            dispatchUser({ type: "login", user: data });
          } else {
            dispatchUser({ type: "logout" });
          }
        }
        isWaiting.current = false;
      });
      readyPromise.current = promise;
      return promise;
    }
    return readyPromise.current;
  };

  const isAuthenticated = () => {
    return user.user !== null;
  };

  const isEditor = () => {
    return user.user?.is_editor ?? false;
  };

  const makeRequest = (config: AxiosConfig, setCurUser: boolean = false) => {
    return axios({
      ...config,
      url: getApiUrl(config.url),
      headers: user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {},
    }).then(
      (resp: AxiosResponse<UserAPIResponse>) => {
        if (resp.status === 401 || resp.status === 403) {
          // auth error
          throw ERRORS.REQUEST.NEEDS_AUTHENTICATION;
        }
        if (!resp.data.success) {
          throw resp.data.error ?? { detail: [ERRORS.REQUEST.DID_NOT_SUCCEED] };
        }
        if (setCurUser) {
          dispatchUser({ type: "post", user: resp.data.data });
        }
        return resp.data.data;
      },
      (err: AxiosError) => {
        throw err.response?.data.error ?? {
          detail: [ERRORS.REQUEST.DID_NOT_SUCCEED],
        };
      }
    );
  };

  const post = <T extends {}>(
    url: string,
    data: T,
    setCurUser: boolean = false
  ) => {
    return makeRequest(
      {
        method: "post",
        url,
        data,
      },
      setCurUser
    );
  };

  const put = <T extends {}>(
    url: string,
    data: T,
    setCurUser: boolean = false
  ) => {
    return makeRequest(
      {
        method: "put",
        url,
        data,
      },
      setCurUser
    );
  };

  const patch = <T extends {}>(
    url: string,
    data: T,
    setCurUser: boolean = false
  ) => {
    return makeRequest(
      {
        method: "patch",
        url,
        data,
      },
      setCurUser
    );
  };

  const del = (url: string) => {
    return makeRequest(
      {
        method: "delete",
        url,
      },
      false
    );
  };

  const login = (username: string, password: string) => {
    const body = {
      username: username,
      password: password,
    };
    const headers = user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {};
    return axios
      .post<UserAPIResponse>(getApiUrl("login/"), body, {
        headers: headers,
      })
      .then(
        (resp) => {
          if (resp.data.success) {
            dispatchUser({ type: "login", user: resp.data.data });
            return resp.data.data;
          }
        },
        (err: AxiosError) => {
          throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
        }
      );
  };

  const logout = () => {
    const headers = user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {};
    return axios
      .post<APIResponse<undefined>>(
        getApiUrl("logout/"),
        {},
        {
          headers: headers,
        }
      )
      .then(
        (resp) => {
          if (resp.data.success) {
            dispatchUser({ type: "logout" });
          }
        },
        (err: AxiosError) => {
          throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
        }
      );
  };

  useEffect(() => {
    check();
  }, []);

  return (
    <Auth.Provider
      value={{
        user: user.user,
        csrfToken: user.csrfToken,
        check,
        isAuthenticated,
        isEditor,
        post,
        put,
        patch,
        delete: del,
        login,
        logout,
      }}
    >
      {props.children}
    </Auth.Provider>
  );
};

export const useAuth = () => useContext(Auth);
