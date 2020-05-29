import { User } from "../shared/types";
import { createContext, useContext } from "react";
import Cookie from "js-cookie";

export interface AuthContext {
  user: User | null;
  csrfToken: string | null;
  check: (force?: boolean) => Promise<void>;
  isAuthenticated: () => boolean;
  isEditor: () => boolean;
  post: <T>(
    endpoint: string,
    data: T,
    setCurUser?: boolean
  ) => Promise<User | undefined>;
  put: <T>(
    endpoint: string,
    data: T,
    setCurUser?: boolean
  ) => Promise<User | undefined>;
  patch: <T>(
    endpoint: string,
    data: T,
    setCurUser?: boolean
  ) => Promise<User | undefined>;
  delete: (endpoint: string) => Promise<User | undefined>;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
}

export interface AuthState {
  user: User | null;
  csrfToken: string | null;
}

export type AuthAction =
  | { type: "post"; user: User }
  | { type: "login"; user: User }
  | { type: "logout" };

export const defaultAuthContext = {
  user: null,
  csrfToken: null,
  check: () => Promise.resolve(),
  isAuthenticated: () => false,
  isEditor: () => false,
  post: () => Promise.resolve(undefined),
  put: () => Promise.resolve(undefined),
  patch: () => Promise.resolve(undefined),
  delete: () => Promise.resolve(undefined),
  setUser: () => {},
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(),
};

export const Auth = createContext<AuthContext>(defaultAuthContext);

export const CSRF_COOKIE = "csrftoken";
export const USER_LOCALSTORAGE_KEY = "slugline-user";

export const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case "post":
    case "login": {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          USER_LOCALSTORAGE_KEY,
          JSON.stringify(action.user)
        );
      }
      return {
        user: action.user,
        csrfToken: Cookie.get(CSRF_COOKIE) || null,
      };
    }
    case "logout": {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(USER_LOCALSTORAGE_KEY);
      }
      return {
        user: null,
        csrfToken: Cookie.get(CSRF_COOKIE) || null,
      };
    }
  }
  return state;
};

export const useAuth = () => useContext(Auth);
