import React, { createContext, useState, useContext, useEffect, useReducer, useRef } from "react";
import Cookie from "js-cookie";

import { User, UserAPIResponse, AuthContext, AuthResponse } from "../shared/types";
import axios, {AxiosError} from "axios";
import { getApiUrl } from "../api/api";
import ERRORS from "../shared/errors";

interface AuthState {
  user?: User;
  csrfToken?: string;
}

type AuthAction =
  { type: 'post', user: User } |
  { type: 'login', user: User } |
  { type: 'logout' };

const Auth = createContext<AuthContext>({
  user: undefined,
  csrfToken: undefined,
  check: () => undefined,
  isAuthenticated: () => false,
  isEditor: () => false,
  post: () => Promise.resolve(undefined),
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve()
});

const CSRF_COOKIE = "csrftoken";

export const AuthProvider: React.FC = props => {
  const [readyPromise, setReadyPromise] = useState<Promise<void> | undefined>(undefined);
  const isWaiting = useRef<boolean>(false);
  const [user, dispatchUser] = useReducer((state: AuthState, action: AuthAction) => {
    switch (action.type) {
    case 'post':
      return {
        user: action.user,
        csrfToken: state.csrfToken
      };
    case 'login':
      return {
        user: action.user,
        csrfToken: Cookie.get(CSRF_COOKIE)
      };
    case 'logout':
      return {
        csrfToken: Cookie.get(CSRF_COOKIE)
      };
    }
    return state;
  }, {});

  const check = (force: boolean = false) => {
    if (!isWaiting.current && (force || readyPromise === undefined)) {
      isWaiting.current = true;
      const promise = axios.get<AuthResponse>(getApiUrl("auth/")).then(resp => {
        if (resp.data.user && user.user === undefined) {
          dispatchUser({ type: 'login', user: resp.data.user });
        } else if (resp.data.user === undefined) {
          dispatchUser({ type: 'logout' });
        }
        isWaiting.current = false;
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      });
      setReadyPromise(promise);
      return promise;
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
        if (resp.data.success === undefined && resp.data.user === undefined) {
          // auth error
          throw ERRORS.REQUEST.NEEDS_AUTHENTICATION;
        }
        if (!resp.data.success || resp.data.user === undefined) {
          throw resp.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
        }
        if (setCurUser) {
          dispatchUser({type: 'post', user: resp.data.user});
        }
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
        dispatchUser({ type: 'login', user: resp.data });
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
        dispatchUser({ type: 'logout' });
      }, (err: AxiosError) => {
        throw err.response?.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
      });
  };

  useEffect(() => {
    check();
  }, []);

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
