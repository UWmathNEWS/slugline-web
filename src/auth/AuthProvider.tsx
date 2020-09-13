import React, { useEffect, useReducer, useRef } from "react";

import { User, APIResponse } from "../shared/types";
import Cookie from "js-cookie";
import { authReducer, Auth, CSRF_COOKIE } from "./Auth";
import api from "../api/api";
import { atLeast } from "../shared/helpers/user";

export const AuthProvider: React.FC = (props) => {
  const storedUser: User | null | undefined = window.__SSR_DIRECTIVES__.USER;
  const readyPromise = useRef<Promise<APIResponse<User | null>> | undefined>(
    undefined
  );
  const isWaiting = useRef<boolean>(false);
  const [user, dispatchUser] = useReducer(authReducer, {
    user: storedUser !== undefined ? storedUser : null,
    csrfToken: Cookie.get(CSRF_COOKIE) || null,
  });

  const setUser = (user: User | null) => {
    if (user) {
      dispatchUser({ type: "login", user });
    } else {
      dispatchUser({ type: "logout" });
    }
  };

  const check = (force: boolean = false): Promise<APIResponse<User | null>> => {
    if ("USER" in window.__SSR_DIRECTIVES__ && !force) {
      readyPromise.current = Promise.resolve({
        success: true,
        statusCode: 200,
        data: window.__SSR_DIRECTIVES__.USER,
      });
      delete window.__SSR_DIRECTIVES__.USER;
    }

    if (readyPromise.current === undefined || (!isWaiting.current && force)) {
      // Ensure we don't end up with a race condition --- we now have an invariant that only one network request
      // will be made at any point in time
      isWaiting.current = true;
      const promise = api.me.get().then((resp) => {
        if (resp.success) {
          // this destructuring gets Typescript to believe that data does in fact exist
          const { data } = resp;
          // Test equality of received data here with the current user. If they're not equal, update internal state;
          // otherwise, do nothing to save a rerender.
          // Due to above invariant, we can be assured that user is up-to-date, since nothing can change it.
          if (
            (user.user !== null && data === null) ||
            (user.user === null && data !== null) ||
            // Conduct a deep equality check of two User objects
            (user.user !== null &&
              data !== null &&
              // Typescript thinks user.user could be null despite our check above, hence the ! suffix
              Object.keys(data).some(
                (k) => user.user![k as keyof User] !== data[k as keyof User]
              ))
          ) {
            setUser(resp.data);
          }
        }
        isWaiting.current = false;
        return resp;
      });
      readyPromise.current = promise;
      return promise;
    }
    return readyPromise.current;
  };

  const isAuthenticated = () => {
    return user.user !== null;
  };

  const isEditor = () => atLeast(user.user, "Editor");

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
        }
        return resp;
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
        return resp;
      });
  };

  useEffect(() => {
    check().then();
    // We only need to call check on component mount, hence the empty dependency array. The patch that disables ESLint
    // yelling at us in this scenario hasn't landed in our toolchain yet, so we disable the warning for now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setUser,
      }}
    >
      {props.children}
    </Auth.Provider>
  );
};
