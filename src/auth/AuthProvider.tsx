import React, { createContext, useState, useContext, useEffect } from "react";
import Cookie from "js-cookie";

import { User, AuthResponse } from "../shared/types";
import axios from "axios";
import { getApiUrl } from "../api/api";

export interface AuthContext {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: () => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Auth = createContext<AuthContext>({
  user: null,
  csrfToken: null,
  isAuthenticated: () => false,
  login: (username: string, password: string) => Promise.resolve(),
  logout: () => Promise.resolve()
});

const CSRF_COOKIE = "csrftoken";

const USER_LOCALSTORAGE_KEY = "slugline-user";

export const AuthProvider: React.FC = props => {
  const storedUser = localStorage.getItem(USER_LOCALSTORAGE_KEY);

  const [user, setUserState] = useState<User | null>(
    storedUser !== null ? JSON.parse(storedUser) : null
  );
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user === null) {
      localStorage.removeItem(USER_LOCALSTORAGE_KEY);
    } else {
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(user));
    }
  };

  const isAuthenticated = () => {
    return user !== undefined;
  };

  useEffect(() => {
    axios.get<AuthResponse>(getApiUrl("auth/")).then(resp => {
      setCsrfToken(Cookie.get(CSRF_COOKIE) || null);
      if (resp.data.user) {
        setUser(resp.data.user);
      } else {
        setUser(null);
      }
    });
  }, []);

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
        setCsrfToken(Cookie.get(CSRF_COOKIE) || null);
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
        setUser(null);
        setCsrfToken(Cookie.get(CSRF_COOKIE) || null);
      });
  };

  return (
    <Auth.Provider
      value={{
        user: user,
        csrfToken: csrfToken,
        isAuthenticated: isAuthenticated,
        login: login,
        logout: logout
      }}
    >
      {props.children}
    </Auth.Provider>
  );
};

export const useAuth = () => useContext(Auth);
