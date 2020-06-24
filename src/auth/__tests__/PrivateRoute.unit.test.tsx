import "core-js";
import React from "react";
import { Router, Switch, Route, Link } from "react-router-dom";
import { createMemoryHistory, History } from "history";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import {
  testUser,
  testAdmin,
  MOCK_ERROR,
  ForceCheck,
} from "../../shared/test-utils";
import mockAxios from "jest-mock-axios";
import PrivateRoute from "../PrivateRoute";
import { Auth } from "../Auth";
import { AuthProvider } from "../AuthProvider";
import ERRORS from "../../shared/errors";

describe("Unit test for PrivateRoute", () => {
  let history: History;

  beforeEach(() => {
    window.__SSR_DIRECTIVES__ = {};
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
    const { queryByRole, getByText } = render(
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

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when on admin-only routes for logged-in non-admin users", async () => {
    const { queryByRole, getByText } = render(
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

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("404")).toBeInTheDocument();
  });

  it("displays content for logged-in users", async () => {
    const { queryByRole, getByText } = render(
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

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("displays admin content for admins", async () => {
    const { queryByRole, getByText } = render(
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

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("Secret")).toBeInTheDocument();
  });

  it("shows error page when admin has been downgraded to user", async () => {
    window.__SSR_DIRECTIVES__ = { USER: testAdmin };

    const { queryByRole, getByText } = render(
      <Router history={history}>
        <ForceCheck history={history} />
        <Link to="/admin">Go to admin</Link>
        <Switch>
          <Route path="/private">Not so secret</Route>
          <PrivateRoute admin path="/admin">
            Secret
          </PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      history.push("/admin");
    });

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows error page when user has been logged out elsewhere", async () => {
    window.__SSR_DIRECTIVES__ = { USER: testUser };

    const { queryByRole, getByText } = render(
      <Router history={history}>
        <ForceCheck history={history} />
        <Link to="/admin">Go to admin</Link>
        <Switch>
          <Route path="/private">Not so secret</Route>
          <PrivateRoute path="/superprivate">Secret</PrivateRoute>
        </Switch>
      </Router>,
      { wrapper: AuthProvider }
    );

    await act(async () => {
      history.push("/superprivate");
    });

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: null } });
    });

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText("404")).toBeInTheDocument();
  });

  it("shows errors when auth check fails", async () => {
    const { queryByRole, getByText } = render(
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

    expect(queryByRole("status")).not.toBeInTheDocument();
    expect(getByText(ERRORS.__TESTING)).toBeInTheDocument();
  });
});
