import React, { createContext, useState, useContext } from "react"
import Cookie from 'js-cookie';

import { User } from "../shared/types";
import axios from "axios";
import { getApiUrl } from "../api/api";

export interface AuthContext {
  user?: User,
  csrfToken?: string,
  isAuthenticated: () => boolean,
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Auth = createContext<AuthContext>({
  user: undefined,
  csrfToken: undefined,
  isAuthenticated: () => false,
  login: (username: string, password: string) => Promise.resolve(),
  logout: () => Promise.resolve()
})

export const AuthProvider: React.FC = (props) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);

  const isAuthenticated = () => {
    return user !== undefined;
  }

  const login = (username: string, password: string) => {
    const body = {
      username: username,
      password: password
    }
    const headers = csrfToken ? { 'X-CSRFToken': csrfToken } : {}
    return axios.post<User>(getApiUrl('login/'), body, {
      headers: headers
    }).then(resp => {
      setUser(resp.data);
      setCsrfToken(Cookie.get('csrftoken'))
    });
  }

  const logout = () => {
    const headers = csrfToken ? { 'X-CSRFToken': csrfToken } : {}
    return axios.post<User>(getApiUrl('logout/'), {}, {
      headers: headers
    }).then(() => {
      setUser(undefined);
      setCsrfToken(Cookie.get('csrftoken'))
    });
  }

  return <Auth.Provider
    value={{
      user: user,
      csrfToken: csrfToken,
      isAuthenticated: isAuthenticated,
      login: login,
      logout: logout,
    }}
  >
    {props.children}
  </Auth.Provider>
}

export const useAuth = () => useContext(Auth)
