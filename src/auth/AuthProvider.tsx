import React, { createContext, useState, useContext, useEffect } from "react";
import Cookie from "js-cookie";

import { User, UserAPIError, UserAPIResponse, AuthContext, AuthResponse } from "../shared/types";
import axios, {AxiosError} from "axios";
import { getApiUrl } from "../api/api";
import ERRORS from "../shared/errors";

const Auth = createContext<AuthContext>({
  user: undefined,
  csrfToken: undefined,
  check: (force: boolean = false) => undefined,
  isAuthenticated: () => false,
  isEditor: () => false,
  post: <T extends {}>(endpoint: string, post_data: T, setCurUser: boolean = false) => Promise.resolve(undefined),
  login: (username: string, password: string) => Promise.resolve(undefined),
  logout: () => Promise.resolve()
});

const CSRF_COOKIE = "csrftoken";

export const AuthProvider: React.FC = props => {
  const [readyPromise, setReadyPromise] = useState<Promise<void> | undefined>(undefined);
  const [user, setUser] = useState<{ user?: User, csrfToken?: string }>({});
  let is_waiting = false;

  const check = (force: boolean = false) => {
    if (!is_waiting && (force || readyPromise === undefined)) {
      is_waiting = true;
      setReadyPromise(axios.get<AuthResponse>(getApiUrl("auth/")).then(resp => {
        if (resp.data.user) {
          setUser({
            user: resp.data.user,
            csrfToken: Cookie.get(CSRF_COOKIE)
          });
        } else {
          setUser({
            csrfToken: Cookie.get(CSRF_COOKIE)
          });
        }
        is_waiting = false;
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      }));
    }
    return readyPromise;
  };

  const isAuthenticated = () => {
    return user?.user !== undefined;
  };

  const isEditor = () => {
    return user?.user?.is_editor ?? false;
  };

  const post = <T extends {}>(endpoint: string, post_data: T, setCurUser: boolean = false) => {
    const headers = user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {};
    return axios
      .post<UserAPIResponse>(getApiUrl(endpoint), post_data, {
        headers: headers
      })
      .then(resp => {
        if (!resp.data.success || resp.data.user === undefined) {
          throw resp.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
        }
        setUser(prevUser => ({
          user: resp.data.user,
          csrfToken: prevUser.csrfToken
        }));
        return resp.data.user;
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      });
  };

  const login = (username: string, password: string) => {
    const body = {
      username: username,
      password: password
    };
    const headers = user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {};
    return axios
      .post<User>(getApiUrl("login/"), body, {
        headers: headers
      })
      .then(resp => {
        setUser({
          user: resp.data,
          csrfToken: Cookie.get(CSRF_COOKIE)
        });
        return resp.data;
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      });
  };

  const logout = () => {
    const headers = user.csrfToken ? { "X-CSRFToken": user.csrfToken } : {};
    return axios
      .post<User>(
        getApiUrl("logout/"),
        {},
        {
          headers: headers
        }
      )
      .then(() => {
        setUser({
          csrfToken: Cookie.get(CSRF_COOKIE)
        });
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      });
  };

  check();

  return (
    <Auth.Provider
      value={{
        user: user?.user,
        csrfToken: user?.csrfToken,
        check,
        isAuthenticated,
        isEditor,
        post,
        login,
        logout
      }}
    >
      {props.children}
    </Auth.Provider>
  );
};

export const useAuth = () => useContext(Auth);
