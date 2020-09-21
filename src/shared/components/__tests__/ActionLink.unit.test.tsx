import React from "react";
import { render } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import ActionLink from "../ActionLink";

describe("ActionLink", () => {
  it("forwards refs", () => {
    const history = createMemoryHistory();
    const testRef = React.createRef<HTMLAnchorElement>();
    render(
      <Router history={history}>
        <ActionLink to="/test" ref={testRef}>
          Test
        </ActionLink>
      </Router>
    );
    expect(testRef.current).toBeInstanceOf(HTMLAnchorElement);
    expect(testRef.current?.getAttribute("href")).toBe("/test");
  });

  it("renders with passed-in classes", () => {
    const history = createMemoryHistory();
    const { getByRole } = render(
      <Router history={history}>
        <ActionLink to="/test" className="bingo">
          Test
        </ActionLink>
      </Router>
    );
    expect(getByRole("link").className).toMatch(/ActionLink/);
    expect(getByRole("link").className).toMatch(/bingo/);
  });

  it("forwards props", () => {
    const history = createMemoryHistory();
    const { getByRole } = render(
      <Router history={history}>
        <ActionLink to="/test" role="button">
          Test
        </ActionLink>
      </Router>
    );
    expect(getByRole("button")).toHaveTextContent(/Test/);
  });
});
