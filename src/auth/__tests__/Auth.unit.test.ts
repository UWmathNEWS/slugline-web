import { User } from "../../shared/types";
import { testAdmin, testUser } from "../../shared/test-utils";
import { authReducer, CSRF_COOKIE } from "../Auth";
import Cookies from "js-cookie";

describe("authReducer", () => {
  let authState: { user: User | null; csrfToken: string | null };

  beforeAll(() => {
    Cookies.set(CSRF_COOKIE, 'csrf')
  });

  beforeEach(() => {
    window.__SSR_DIRECTIVES__ = {};
    authState = {
      user: null,
      csrfToken: null,
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    Cookies.remove(CSRF_COOKIE)
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
  });
});
