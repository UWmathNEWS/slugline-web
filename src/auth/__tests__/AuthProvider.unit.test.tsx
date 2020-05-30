import React from "react";
import { AuthContext, useAuth, CSRF_COOKIE } from "../Auth";
import { AuthProvider } from "../AuthProvider";
import { render } from "@testing-library/react";
import { HookResult, renderHook, act } from "@testing-library/react-hooks";
import mockAxios from "jest-mock-axios";
import {
  makeTestError,
  testAdmin,
  testUser,
  MOCK_ERROR,
} from "../../shared/test-utils";
import ERRORS from "../../shared/errors";

// for spies
import * as _a from "../Auth";
import { APIResponseFailure, APIError } from "../../shared/types";

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
    mockAxios.mockClear();
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
    expect("setUser" in auth).toBe(true);
    expect("login" in auth).toBe(true);
    expect("logout" in auth).toBe(true);
  });

  it("does an auth check on mount", () => {
    render(<AuthProvider />);

    expect(mockAxios.lastReqGet().url).toEqual("me/");
  });

  it("doesn't crash if the initial check fails", async () => {
    const { getByText } = render(<AuthProvider>test</AuthProvider>);

    await act(async () => {
      mockAxios.mockResponse({ data: MOCK_ERROR });
    });

    expect(getByText("test")).toBeInTheDocument();
  });

  it("gives the correct user", async () => {
    expect(auth.user).toBeNull();

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    auth = result.current;
    expect(auth.user).toEqual(testUser);
  });

  it("gives the correct CSRF token", async () => {
    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    auth = result.current;
    expect(auth.csrfToken).toBe("csrf");
  });

  describe("check", () => {
    it("does not send multiple requests for consecutive pending check requests", () => {
      auth.check();
      auth.check();

      expect(mockAxios).toHaveBeenCalledTimes(1);
    });

    it("returns the same promise for multiple check requests", () => {
      const promise1 = auth.check();
      const promise2 = auth.check();

      expect(promise1).toBe(promise2);
    });

    it("returns the same promise for multiple check requests when the request is resolved", async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      const promise1 = auth.check();
      const promise2 = auth.check();

      expect(promise1).toBe(promise2);
    });

    it("creates a new request when forced", async () => {
      // Clear existing check request
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      expect(mockAxios).toHaveBeenCalledTimes(2);
    });

    it("does not change AuthProvider internal state if result of check is the same as current state", async () => {
      // (1) Check anonymous users
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(auth).toBe(result.current);

      // (2) Check logged-in users
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      expect(auth).toBe(result.current);
    });

    it("does not change AuthProvider internal state until promise is resolved", async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      expect(auth).toBe(result.current);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      expect(auth).not.toBe(result.current);
    });

    it("updates the user if they logged in between checks", async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      auth = result.current;
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      expect(auth).not.toBe(result.current);

      auth = result.current;
      expect(auth.user).not.toBeNull();
    });

    it("updates the user if they logged out between checks", async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(auth).not.toBe(result.current);

      auth = result.current;
      expect(auth.user).toBeNull();
    });

    it("updates the user if they changed between checks", async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
      });

      expect(auth).not.toBe(result.current);

      auth = result.current;
      expect(auth.user).not.toEqual(testUser);
    });

    it("handles unsuccessful requests by returning an error", async () => {
      let checkPromise: Promise<any>;

      checkPromise = auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: MOCK_ERROR });
      });

      await act(async () => {
        const resp = (await checkPromise) as APIResponseFailure<APIError>;
        auth = result.current;

        expect(resp.success).toBe(false);
        expect(resp).toEqual(MOCK_ERROR);
        expect(auth.user).toBeNull();
      });
    });
  });

  describe("isAuthenticated", () => {
    it("is true if and only if the user is authenticated", async () => {
      expect(auth.isAuthenticated()).toBe(false);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe("isEditor", () => {
    it("is true if and only if the user is an editor", async () => {
      expect(auth.isEditor()).toBe(false);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      auth = result.current;
      expect(auth.isEditor()).toBe(false);

      auth.check(true);

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
      });

      auth = result.current;
      expect(auth.isEditor()).toBe(true);
    });
  });

  describe("setUser", () => {
    beforeEach(async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });
      auth = result.current;
    });

    it("changes the user given a non-null user", async () => {
      await act(async () => {
        auth.setUser(testAdmin);
      });

      auth = result.current;

      expect(auth.user).toEqual(testAdmin);
    });

    it("logs out given a null user", async () => {
      await act(async () => {
        auth.setUser(null);
      });

      auth = result.current;

      expect(auth.user).toEqual(null);
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await act(async () => {
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
        "X-CSRFToken": auth.csrfToken,
      });
    });

    it("sends the login action to authReducer", async () => {
      const spy = jest.spyOn(_a, "authReducer");

      auth.login("test", "test");

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });

      const mockCall = spy.mock.calls[0][1] as { type: string; user: any };
      expect(mockCall.type).toBe("login");
      expect(mockCall.user).toEqual(testUser);

      spy.mockRestore();
    });

    it("handles unsuccessful requests by returning an error", async () => {
      let loginPromise = auth.login("test", "test");

      await act(async () => {
        mockAxios.mockResponse({ data: MOCK_ERROR });
      });

      await act(async () => {
        const resp = (await loginPromise) as APIResponseFailure<APIError>;
        auth = result.current;

        expect(resp.success).toBe(false);
        expect(resp).toEqual(MOCK_ERROR);
        expect(auth.user).toBeNull();
      });
    });
  });

  describe("logout", () => {
    beforeEach(async () => {
      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: testUser } });
      });
      auth = result.current;
    });

    it("sends a CSRF token with the logout request", () => {
      auth.logout();

      expect(mockAxios.lastReqGet().config.headers).toEqual({
        "X-CSRFToken": auth.csrfToken,
      });
    });

    it("sends the logout action to authReducer", async () => {
      const spy = jest.spyOn(_a, "authReducer");

      auth.logout();

      await act(async () => {
        mockAxios.mockResponse({ data: { success: true, data: null } });
      });

      expect(spy.mock.calls[0][1].type).toBe("logout");

      spy.mockRestore();
    });

    it("handles unsuccessful requests by returning an error", async () => {
      let logoutPromise = auth.logout();

      await act(async () => {
        mockAxios.mockResponse({
          data: MOCK_ERROR,
        });
      });

      await act(async () => {
        const resp = (await logoutPromise) as APIResponseFailure<APIError>;

        expect(resp.success).toBe(false);
        expect(resp).toEqual(MOCK_ERROR);
        expect(auth.user).not.toBeNull();
      });
    });
  });
});
