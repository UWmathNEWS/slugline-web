import React from "react";
import { Auth, AuthProvider, authReducer, useAuth } from "../AuthProvider";
import { render } from "@testing-library/react";
import { HookResult, renderHook, act } from "@testing-library/react-hooks";
import mockAxios from "jest-mock-axios";
import { CSRF_COOKIE, makeTestError, testAdmin, testUser, USER_LOCALSTORAGE_KEY } from "../../shared/test-utils";
import ERRORS from "../../shared/errors";
import { User, AuthContext } from "../../shared/types";

describe("authReducer", () => {
  let authState: { user: User | null, csrfToken: string | null; };

  beforeAll(() => {
    window.document.cookie = `${CSRF_COOKIE}=csrf`;
  });

  beforeEach(() => {
    authState = {
      user: null,
      csrfToken: null
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    delete window.document.cookie;
  });

  describe("action:post", () => {
    it("returns the passed-in user", () => {
      const { user } = authReducer(authState, {
        type: "post",
        user: testUser,
      });

      expect(user).toEqual(testUser);
    });

    it("does not update the CSRF token", () => {
      authState.csrfToken = "abcd";
      const { csrfToken } = authReducer(authState, {
        type: "post",
        user: testUser,
      });

      expect(csrfToken).toBe("abcd");
    });

    it("updates the user in localStorage", () => {
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));
      authReducer(authState, {
        type: "post",
        user: testAdmin,
      });

      expect(JSON.parse(localStorage.getItem(USER_LOCALSTORAGE_KEY) || "")).not.toEqual(testUser);
    });
  });

  describe("action:login", () => {
    it("returns the passed-in user", () => {
      const { user } = authReducer(authState, {
        type: "login",
        user: testUser,
      });

      expect(user).toEqual(testUser);
    });

    it("updates the CSRF token", () => {
      authState.csrfToken = "abcd";
      const { csrfToken } = authReducer(authState, {
        type: "login",
        user: testUser,
      });

      expect(csrfToken).toBe("csrf");
    });

    it("updates the user in localStorage", () => {
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));
      authReducer(authState, {
        type: "login",
        user: testAdmin,
      });

      expect(JSON.parse(localStorage.getItem(USER_LOCALSTORAGE_KEY) || "")).not.toEqual(testUser);
    });
  });

  describe("action:logout", () => {
    it("clears the user", () => {
      const { user } = authReducer(authState, {
        type: "logout",
      });

      expect(user).toBeNull();
    });

    it("updates the CSRF token", () => {
      authState.csrfToken = "abcd";
      const { csrfToken } = authReducer(authState, {
        type: "logout",
      });

      expect(csrfToken).toBe("csrf");
    });

    it("removes the user in localStorage", () => {
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));
      authReducer(authState, {
        type: "logout",
      });

      expect(localStorage.getItem(USER_LOCALSTORAGE_KEY)).toBeNull();
    });
  });
});

describe("AuthProvider", () => {
  let result: HookResult<AuthContext>;
  let auth: AuthContext;

  beforeAll(() => {
    window.document.cookie = `${CSRF_COOKIE}=csrf`;
  });

  beforeEach(() => {
    result = renderHook(() => useAuth(), { wrapper: AuthProvider }).result;
    auth = result.current;
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  afterAll(() => {
    delete window.document.cookie;
  });

  it("provides access to all fields in interface (sanity check)", () => {
    expect("user" in auth).toBe(true);
    expect("csrfToken" in auth).toBe(true);
    expect("check" in auth).toBe(true);
    expect("isAuthenticated" in auth).toBe(true);
    expect("isEditor" in auth).toBe(true);
    expect("post" in auth).toBe(true);
    expect("put" in auth).toBe(true);
    expect("patch" in auth).toBe(true);
    expect("delete" in auth).toBe(true);
    expect("login" in auth).toBe(true);
    expect("logout" in auth).toBe(true);
  });

  it("does an auth check on mount", () => {
    render(<AuthProvider/>);

    expect(mockAxios.get).toHaveBeenCalledWith("/api/me/");
  });

  it("doesn't crash if the initial check fails", () => {
    const { getByText } = render(<AuthProvider>
      test
    </AuthProvider>);

    act(() => {
      mockAxios.mockError(makeTestError(500, ERRORS.__TESTING));
    });

    expect(getByText("test")).toBeInTheDocument();
  });

  it("gives the correct user", () => {
    expect(auth.user).toBeNull();

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    auth = result.current;
    expect(auth.user).toEqual(testUser);
  });

  it("gives the correct CSRF token", () => {
    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    auth = result.current;
    expect(auth.csrfToken).toBe("csrf");
  });

  describe("check", () => {
    it("does not send multiple requests for consecutive pending check requests", () => {
      auth.check();
      auth.check();

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it("returns the same promise for multiple check requests", () => {
      const promise1 = auth.check();
      const promise2 = auth.check();

      expect(promise1).toBe(promise2);
    });

    it("returns the same promise for multiple check requests when the request is resolved", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      const promise1 = auth.check();
      const promise2 = auth.check();

      expect(promise1).toBe(promise2);
    });

    it("creates a new request when forced", () => {
      // Clear existing check request
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });

    it("does not change AuthProvider internal state until promise is resolved", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      expect(auth).toBe(result.current);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(auth).not.toBe(result.current);
    });

    it("updates the user if they logged in between checks", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.user).not.toBeNull();
    });

    it("updates the user if they logged out between checks", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      expect(auth.user).toBeNull();
    });

    it("handles unsuccessful requests by throwing an error", async () => {
      let checkPromise: Promise<any>;

      checkPromise = auth.check(true)!; // if the force flag is true then check must return a promise

      act(() => {
        mockAxios.mockError(makeTestError(500, ERRORS.__TESTING));
      });

      await act(async () => {
        try {
          await checkPromise;
          expect("Error was not thrown by AuthProvider.check()").toBe(false);
        } catch (e) {
          auth = result.current;

          expect(e).toBe(ERRORS.__TESTING);
          expect(auth.user).toBeNull();
        }
      });
    });
  });

  describe("isAuthenticated", () => {
    it("is true if and only if the user is authenticated", () => {
      expect(auth.isAuthenticated()).toBe(false);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe("isEditor", () => {
    it("is true if and only if the user is an editor", () => {
      expect(auth.isEditor()).toBe(false);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.isEditor()).toBe(false);

      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
      });

      auth = result.current;
      expect(auth.isEditor()).toBe(true);
    });
  });

  describe("login", () => {
    beforeEach(() => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });
      auth = result.current;
    });

    it("sends the supplied credentials to the server", () => {
      auth.login("test", "test");

      expect(mockAxios.lastReqGet().data).toEqual({
        username: "test",
        password: "test",
      });
    });

    it("sends a CSRF token with the login request", () => {
      auth.login("test", "test");

      expect(mockAxios.lastReqGet().config.headers).toEqual({
        "X-CSRFToken": auth.csrfToken
      });
    });

    it("logs in the user with the provided data", () => {
      auth.login("test", "test");

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.user).toEqual(testUser);
    });

    it("handles unsuccessful requests by throwing an error", async () => {
      let loginPromise = auth.login("test", "test");

      act(() => {
        mockAxios.mockError(makeTestError(500, ERRORS.__TESTING));
      });

      await act(async () => {
        try {
          await loginPromise;
          expect("Error was not thrown by AuthProvider.login()").toBe(false);
        } catch (e) {
          auth = result.current;

          expect(e).toBe(ERRORS.__TESTING);
          expect(auth.user).toBeNull();
        }
      });
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });
      auth = result.current;
    });

    it("sends a CSRF token with the logout request", () => {
      auth.logout();

      expect(mockAxios.lastReqGet().config.headers).toEqual({
        "X-CSRFToken": auth.csrfToken
      });
    });

    it("logs out the user", () => {
      auth.logout();

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      expect(auth.user).toBeNull();
    });

    it("handles unsuccessful requests by throwing an error", async () => {
      let logoutPromise = auth.logout();

      act(() => {
        mockAxios.mockError(makeTestError(500, ERRORS.__TESTING));
      });

      await act(async () => {
        try {
          await logoutPromise;
          expect("Error was not thrown by AuthProvider.logout()").toBe(false);
        } catch (e) {
          auth = result.current;

          expect(e).toBe(ERRORS.__TESTING);
          expect(auth.user).not.toBeNull();
        }
      });
    });
  });
});
