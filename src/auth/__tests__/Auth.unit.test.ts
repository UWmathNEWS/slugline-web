import { User } from "../../shared/types";
import { testAdmin, testUser } from "../../shared/test-utils";
import { authReducer, CSRF_COOKIE, USER_LOCALSTORAGE_KEY } from "../Auth";

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

