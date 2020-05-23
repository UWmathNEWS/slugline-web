import { AuthContext, User } from "../shared/types";
import { createContext, useContext } from "react";
import Cookie from "js-cookie";

export interface AuthState {
  user: User | null;
  csrfToken: string | null;
}

export type AuthAction =
  | { type: "post"; user: User }
  | { type: "login"; user: User }
  | { type: "logout" };

export const Auth = createContext<AuthContext>({
  user: null,
  csrfToken: null,
  check: () => undefined,
  isAuthenticated: () => false,
  isEditor: () => false,
  post: () => Promise.resolve(undefined),
  put: () => Promise.resolve(undefined),
  patch: () => Promise.resolve(undefined),
  delete: () => Promise.resolve(undefined),
  setUser: () => {},
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(),
});

export const CSRF_COOKIE = "csrftoken";
export const USER_LOCALSTORAGE_KEY = "slugline-user";

export const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case "post":
    case "login":
      localStorage.setItem(
        USER_LOCALSTORAGE_KEY,
        JSON.stringify(action.user)
      );
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
