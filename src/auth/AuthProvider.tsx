import React, { createContext, useState, useContext, useEffect } from "react";
import Cookie from "js-cookie";

import { User, UserAPIError, UserAPIResponse, AuthContext, AuthResponse } from "../shared/types";
import axios from "axios";
import { getApiUrl } from "../api/api";

const Auth = createContext<AuthContext>({
  user: undefined,
  csrfToken: undefined,
  check: (force: boolean = false) => undefined,
  isAuthenticated: () => false,
  isEditor: () => false,
  post: <T extends {}>(endpoint: string, post_data: T) => Promise.resolve(),
  login: (username: string, password: string) => Promise.resolve(),
  logout: () => Promise.resolve()
});

const CSRF_COOKIE = "csrftoken";

export const AuthProvider: React.FC = props => {
  const [readyPromise, setReadyPromise] = useState<Promise<void> | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  let is_waiting = false;

  const check = (force: boolean = false) => {
    if (!is_waiting && readyPromise === undefined) {
      is_waiting = true;
      setReadyPromise(axios.get<AuthResponse>(getApiUrl("auth/")).then(resp => {
        setCsrfToken(Cookie.get(CSRF_COOKIE));
        if (resp.data.user) {
          setUser(resp.data.user);
        } else {
          setUser(undefined);
        }
        is_waiting = false;
      }));
    }
    return readyPromise;
  };

  const isAuthenticated = () => {
    return user !== undefined;
  };

  const isEditor = () => {
    return user?.is_editor ?? false;
  };

  const post = <T extends {}>(endpoint: string, post_data: T) => {
    const headers = csrfToken ? { "X-CSRFToken": csrfToken } : {};
    return axios
      .post<UserAPIResponse>(getApiUrl(endpoint), post_data, {
        headers: headers
      })
      .then(resp => {
        if (resp.data.success || resp.data.user === undefined) {
          throw new Error(); // TODO: throw something better;
        }
        setUser(resp.data.user)
      });
  };

  const login = (username: string, password: string) => {
    const body = {
      username: username,
      password: password
    };
    const headers = csrfToken ? { "X-CSRFToken": csrfToken } : {};
    return axios
      .post<User>(getApiUrl("login/"), body, {
        headers: headers
      })
      .then(resp => {
        setUser(resp.data);
        setCsrfToken(Cookie.get("csrftoken"));
      });
  };

  const logout = () => {
    const headers = csrfToken ? { "X-CSRFToken": csrfToken } : {};
    return axios
      .post<User>(
        getApiUrl("logout/"),
        {},
        {
          headers: headers
        }
      )
      .then(() => {
        setUser(undefined);
        setCsrfToken(Cookie.get("csrftoken"));
      });
  };

  useEffect(() => {
    check();
  });

  return (
    <Auth.Provider
      value={{
        user,
        csrfToken,
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
