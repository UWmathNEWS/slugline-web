import "core-js";
import React from "react";
import { Router, Switch } from "react-router-dom";
import { createMemoryHistory, History } from "history";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { USER_LOCALSTORAGE_KEY, testUser, testAdmin } from "../../shared/test-utils";
import mockAxios from "jest-mock-axios";
import PrivateRoute from "../PrivateRoute";
import { Auth, AuthProvider } from "../AuthProvider";

describe("Unit test for PrivateRoute", () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    history.push("/private");
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  it("does an auth check", () => {
    const check = jest.fn(() => mockAxios.get("/api/me/"));
    const { getByRole } = render(<Auth.Provider
      value={{
        user: null,
        csrfToken: "",
        check,
        isAuthenticated: jest.fn(),
        isEditor: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        login: jest.fn(),
        logout: jest.fn()
      }}
    >
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>
    </Auth.Provider>);

    expect(check).toHaveBeenCalled();
    expect(getByRole("status")).toHaveTextContent("Loading...");

    expect(mockAxios.get).toHaveBeenLastCalledWith("/api/me/");
  });

  it("shows error page for anonymous users", () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: null } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when on admin-only routes for logged-in non-admin users", () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute admin path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("displays content for logged-in users", () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("displays admin content for admins", () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute admin path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
    });

    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("shows error page when admin has been downgraded to user", () => {
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testAdmin));

    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute admin path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when user has been logged out elsewhere", () => {
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));

    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockResponse({ data: { success: true, data: null } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows errors when auth check fails", () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    act(() => {
      mockAxios.mockError({
        code: 500,
        response: {
          data: {
            detail: ["Error thrown in testing"]
          }
        }
      });
    });

    expect(getByText("Error thrown in testing")).toBeInTheDocument();
  });
});
