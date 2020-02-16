import React, { createContext, useState, useContext } from "react"
import Cookie from 'js-cookie';


import { login, logout } from '../api/api'

export interface User {
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  is_staff: boolean,
  writer_name: string
}

export interface AuthContext {
  user?: User,
  csrfToken?: string,
  isAuthenticated: () => boolean,
  login: (username: string, password: string) => Promise<void>,
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
    return user == undefined;
  }

  const authLogin = (username: string, password: string) => {
    return login(username, password).then(resp => {
      setUser(resp.data);
      const token = Cookie.get('csrftoken');
      console.log(token);
      setCsrfToken(token);
    })
  }

  const authLogout = () => {
    return logout().then(resp => {
      setUser(undefined);
      setCsrfToken(undefined);
    })
  }

  return <Auth.Provider
    value={{
      user: user,
      csrfToken: csrfToken,
      isAuthenticated: isAuthenticated,
      login: authLogin,
      logout: authLogout
    }}
  >
    {props.children}
  </Auth.Provider>
}

export const useAuth = () => useContext(Auth)
