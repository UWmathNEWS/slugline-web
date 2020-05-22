import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import Cookie from "js-cookie";

import { User, AuthContext, APIResponse } from "../shared/types";
import ERRORS from "../shared/errors";
import api from "../api/api";

interface AuthState {
  user: User | null;
  csrfToken: string | null;
}

type AuthAction = { type: "login"; user: User } | { type: "logout" };

export const Auth = createContext<AuthContext>({
  user: null,
  csrfToken: null,
  check: () => undefined,
  isAuthenticated: () => false,
  isEditor: () => false,
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(),
});

const CSRF_COOKIE = "csrftoken";
const USER_LOCALSTORAGE_KEY = "slugline-user";

export const AuthProvider: React.FC = (props) => {
  const storedUser = localStorage.getItem(USER_LOCALSTORAGE_KEY);
  const [readyPromise, setReadyPromise] = useState<Promise<void> | undefined>(
    undefined
  );
  const isWaiting = useRef<boolean>(false);
  const [user, dispatchUser] = useReducer(
    (state: AuthState, action: AuthAction) => {
      switch (action.type) {
        case "login":
          if (action.user === null) {
            localStorage.removeItem(USER_LOCALSTORAGE_KEY);
          } else {
            localStorage.setItem(
              USER_LOCALSTORAGE_KEY,
              JSON.stringify(action.user)
            );
          }
          return {
            user: action.user,
            csrfToken: Cookie.get(CSRF_COOKIE) || null,
          };
        case "logout":
          return {
            user: null,
            csrfToken: Cookie.get(CSRF_COOKIE) || null,
          };
      }
    },
    {
      user: storedUser !== null ? JSON.parse(storedUser) : null,
      csrfToken: null, // null is a sentinel value here so we know the page was just loaded
    }
  );

  const check = (force: boolean = false) => {
    if (!isWaiting.current && (force || readyPromise === undefined)) {
      isWaiting.current = true;
      const promise = api.me.get().then((resp) => {
        if (user.csrfToken === null) {
          if (resp.success && resp.data) {
            dispatchUser({ type: "login", user: resp.data });
          } else {
            dispatchUser({ type: "logout" });
          }
        }
        isWaiting.current = false;
      });
      setReadyPromise(promise);
      return promise;
    }
    return readyPromise;
  };

  const isAuthenticated = () => {
    return user.user !== null;
  };

  const isEditor = () => {
    return user.user?.is_editor ?? false;
  };

  const login = (username: string, password: string) => {
    return api
      .login({
        body: {
          username: username,
          password: password,
        },
        csrf: user.csrfToken || "",
      })
      .then((resp) => {
        if (resp.success) {
          dispatchUser({ type: "login", user: resp.data });
          return resp.data;
        }
      });
  };

  const logout = () => {
    return api
      .logout({
        csrf: user.csrfToken || "",
        body: undefined,
      })
      .then((resp) => {
        if (resp.success) {
          dispatchUser({ type: "logout" });
        }
      });
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
        login,
        logout,
      }}
    >
      {props.children}
    </Auth.Provider>
  );
};

export const useAuth = () => useContext(Auth);
