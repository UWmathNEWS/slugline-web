import { User } from "../shared/types";
import { createContext, useContext } from "react";
import Cookie from "js-cookie";

export interface AuthContext {
  user: User | null;
  csrfToken: string | null;
  check: (force?: boolean) => Promise<void>;
  isAuthenticated: () => boolean;
  isEditor: () => boolean;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
}

export interface AuthState {
  user: User | null;
  csrfToken: string | null;
}

export type AuthAction = { type: "login"; user: User } | { type: "logout" };

export const Auth = createContext<AuthContext>({
  user: null,
  csrfToken: null,
  check: () => Promise.resolve(),
  isAuthenticated: () => false,
  isEditor: () => false,
  setUser: () => {},
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(),
});

export const CSRF_COOKIE = "csrftoken";
export const USER_LOCALSTORAGE_KEY = "slugline-user";

export const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case "login":
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(action.user));
      return {
        user: action.user,
        csrfToken: Cookie.get(CSRF_COOKIE) || null,
      };
    case "logout":
      localStorage.removeItem(USER_LOCALSTORAGE_KEY);
      return {
        user: null,
        csrfToken: Cookie.get(CSRF_COOKIE) || null,
      };
  }
  return state;
};

export const useAuth = () => useContext(Auth);
