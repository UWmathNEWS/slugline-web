import React from "react";
import { render } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { Button as BsButton } from "react-bootstrap";
import Button, { LinkButton } from "../Button";

describe("Button", () => {
  it("forwards refs", () => {
    const testRef = React.createRef<BsButton & HTMLButtonElement>();
    render(
      <Button variant="primary" ref={testRef}>
        Test
      </Button>
    );

    expect(testRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(testRef.current).toHaveTextContent(/Test/);
  });

  it("renders different variants", () => {
    const { getByRole, rerender } = render(
      <Button variant="primary">Test</Button>
    );

    expect(getByRole("button").className).toMatch(/Button--primary/);

    rerender(<Button variant="secondary">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-secondary/);

    rerender(<Button variant="accent">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-accent/);

    rerender(<Button variant="text">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-text/);
  });

  it("renders with added classes", () => {
    const { getByRole } = render(
      <Button variant="primary" className="bingo">
        Test
      </Button>
    );

    expect(getByRole("button").className).toMatch(/Button/);
    expect(getByRole("button").className).toMatch(/bingo/);
  });

  it("forwards extra props", () => {
    const { getByRole } = render(
      <Button variant="primary" role="link">
        Test
      </Button>
    );

    expect(getByRole("link")).toHaveTextContent(/Test/);
  });
});

describe("LinkButton", () => {
  it("forwards refs", () => {
    const history = createMemoryHistory();
    const testRef = React.createRef<HTMLAnchorElement>();
    render(
      <Router history={history}>
        <LinkButton variant="primary" ref={testRef} to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(testRef.current).toBeInstanceOf(HTMLAnchorElement);
    expect(testRef.current).toHaveTextContent(/Test/);
    expect(testRef.current?.getAttribute("href")).toBe("/test");
  });

  it("renders different variants", () => {
    const history = createMemoryHistory();
    const { getByRole, rerender } = render(
      <Router history={history}>
        <LinkButton variant="primary" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-primary/);

    rerender(
      <Router history={history}>
        <LinkButton variant="secondary" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-secondary/);

    rerender(
      <Router history={history}>
        <LinkButton variant="accent" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-accent/);

    rerender(
      <Router history={history}>
        <LinkButton variant="text" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-text/);
  });

  it("renders with added classes", () => {
    const history = createMemoryHistory();
    const { getByRole } = render(
      <Router history={history}>
        <LinkButton variant="primary" to="/test" className="bingo">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button/);
    expect(getByRole("link").className).toMatch(/bingo/);
  });

  it("forwards extra props", () => {
    const history = createMemoryHistory();
    const { getByRole } = render(
      <Router history={history}>
        <LinkButton variant="primary" to="/test" role="button">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("button")).toHaveTextContent(/Test/);
  });
});
