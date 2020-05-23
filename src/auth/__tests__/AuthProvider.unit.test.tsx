import React from "react";
import { CSRF_COOKIE } from "../Auth";
import { AuthProvider, useAuth } from "../AuthProvider";
import { render } from "@testing-library/react";
import { HookResult, renderHook, act } from "@testing-library/react-hooks";
import mockAxios from "jest-mock-axios";
import { makeTestError, testAdmin, testUser } from "../../shared/test-utils";
import ERRORS from "../../shared/errors";
import { AuthContext } from "../../shared/types";

// for spies
import * as _a from "../Auth";

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

    it("does not change AuthProvider internal state if result of check is the same as current state", () => {
      // (1) Check anonymous users
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(auth).toBe(result.current);

      // (2) Check logged-in users
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      expect(auth).toBe(result.current);
    });

    it("does not change AuthProvider internal state until promise is resolved", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      expect(auth).toBe(result.current);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
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

      expect(auth).not.toBe(result.current);

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

      expect(auth).not.toBe(result.current);

      auth = result.current;
      expect(auth.user).toBeNull();
    });

    it("updates the user if they changed between checks", () => {
      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
      });

      expect(auth).not.toBe(result.current);

      auth = result.current;
      expect(auth.user).not.toEqual(testUser);
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

    it("sends the login action to authReducer", () => {
      const spy = jest.spyOn(_a, "authReducer");

      auth.login("test", "test");

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      expect(spy.mock.calls[0][1].type).toBe("login");
      spy.mockRestore();
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

    it("sends the logout action to authReducer", () => {
      const spy = jest.spyOn(_a, "authReducer");

      auth.logout();

      act(() => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(spy.mock.calls[0][1].type).toBe("logout");
      spy.mockRestore();
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
