import "core-js";

import React from "react";
import ReactDOM from "react-dom";
import mockAxios from "jest-mock-axios";
import { render, fireEvent, getByText } from "@testing-library/react";
import App from "../App";
import { createMemoryHistory } from "history";
import { act } from "react-dom/test-utils";
import { USER_LOCALSTORAGE_KEY } from "../auth/Auth";
import { testUser, MOCK_ERROR } from "../shared/test-utils";

describe("Integration test for main app component", () => {
  afterEach(() => {
    mockAxios.reset();
    mockAxios.mockClear();
    localStorage.clear();
  });

  it("renders without crashing (sanity check)", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
  });

  it("changes routes correctly", async () => {
    const { container, getByRole } = render(<App />);
    const nav = container.querySelector(".navbar") as HTMLElement;
    expect(container.querySelector(".navbar")).toBeInTheDocument();

    const homeLink = nav.querySelector(".navbar-brand");
    const issuesLink = getByText(nav, /issues/i);
    // const aboutLink = getByText(nav, /about/i);
    const loginLink = getByText(nav, /login/i);

    expect(getByText(container, "HOME CONTENT")).toBeInTheDocument();

    // need to await here as navigating to some paths also mounts components that may change their state on mount.
    // by awaiting navigation, we only continue once rendering finishes, thus avoiding race conditions.
    await act(async () => {
      fireEvent.click(issuesLink);
    });
    expect(getByRole("heading")).toHaveTextContent(/issues/i);

    // await act(async () => {
    //   fireEvent.click(aboutLink);
    // });
    // expect(getByRole("heading")).toHaveTextContent(/about/i);

    await act(async () => {
      fireEvent.click(loginLink);
    });
    expect(getByRole("heading")).toHaveTextContent(/login/i);

    await act(async () => {
      fireEvent.click(homeLink!);
    });
    expect(getByText(container, "HOME CONTENT")).toBeInTheDocument();
  });

  it("has correct header when logged in", () => {
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));
    const { container, getByText: _getByText } = render(<App />);

    expect(
      getByText(container.querySelector(".navbar") as HTMLElement, /dash/i)
    ).toBeInTheDocument();
    expect(_getByText(/logout/i)).toBeInTheDocument();
  });

  it("does auth check on startup", () => {
    render(<App />);

    expect(mockAxios).toHaveBeenCalledTimes(1);
    expect(mockAxios.lastReqGet().url).toEqual("me/");
  });

  it("does auth check on switching to protected routes", async () => {
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(testUser));
    const { getByText } = render(<App />);

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    await act(async () => {
      fireEvent.click(getByText(/profile/i));
    });

    expect(mockAxios).toHaveBeenCalledTimes(2);
    expect(mockAxios.lastReqGet().url).toEqual("me/");

    await act(async () => {
      mockAxios.mockResponse({ data: { success: true, data: testUser } });
    });

    expect(getByText(/your profile/i)).toBeInTheDocument();
  });

  it("integrates private routes", async () => {
    const history = createMemoryHistory();
    history.push("/dash");
    const { getByRole, getByText } = render(<App history={history} />);
    expect(getByRole("status")).toHaveTextContent("Loading...");

    expect(mockAxios.lastReqGet().url).toEqual("me/");
    const checkInfo = mockAxios.lastReqGet();
    await act(async () => {
      mockAxios.mockResponse(
        { data: { success: true, data: null } },
        checkInfo
      );
    });

    expect(getByText("404")).toBeInTheDocument();
  });

  it("shouldn't crash if auth check fails", async () => {
    render(<App />);

    await act(async () => {
      mockAxios.mockResponse({ data: MOCK_ERROR });
    });
  });
});
