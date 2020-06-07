import "core-js";
import React from "react";
import { Router, Switch } from "react-router-dom";
import { createMemoryHistory, History } from "history";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { testUser, testAdmin, MOCK_ERROR } from "../../shared/test-utils";
import mockAxios from "jest-mock-axios";
import PrivateRoute from "../PrivateRoute";
import { Auth, USER_LOCALSTORAGE_KEY } from "../Auth";
import { AuthProvider } from "../AuthProvider";
import ERRORS from "../../shared/errors";

describe("Unit test for PrivateRoute", () => {
  let history: History;

  beforeAll(() => {
    window.__SSR_DIRECTIVES__ = {};
  });

  beforeEach(() => {
    history = createMemoryHistory();
    history.push("/private");
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  it("does an auth check (sanity check)", () => {
    const check = jest.fn(() => mockAxios.get("/api/me/"));
    const { getByRole } = render(
      <Auth.Provider
        value={{
          user: null,
          csrfToken: "",
          check,
          isAuthenticated: jest.fn(),
          isEditor: jest.fn(),
          setUser: jest.fn(),
          login: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <Router history={history}>
          <Switch>
            <PrivateRoute path="/private">Secret</PrivateRoute>
          </Switch>
        </Router>
      </Auth.Provider>
    );

    expect(check).toHaveBeenCalled();
    expect(getByRole("status")).toHaveTextContent("Loading...");

    expect(mockAxios.get).toHaveBeenLastCalledWith("/api/me/");
  });

  it("shows error page for anonymous users", async () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">Secret</PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: null } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when on admin-only routes for logged-in non-admin users", async () => {
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

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("displays content for logged-in users", async () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">Secret</PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("displays admin content for admins", async () => {
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

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testAdmin } });
    });

    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("shows error page when admin has been downgraded to user", async () => {
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

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when user has been logged out elsewhere", async () => {
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));

    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">Secret</PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: null } });
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows errors when auth check fails", async () => {
    const { getByText } = render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/private">Secret</PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      mockAxios.mockResponse({
        data: MOCK_ERROR,
      });
    });

    expect(getByText(ERRORS.__TESTING)).toBeInTheDocument();
  });
});
