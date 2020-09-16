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
      <Button variant="dark" ref={testRef}>
        Test
      </Button>
    );

    expect(testRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(testRef.current).toHaveTextContent(/Test/);
  });

  it("renders different variants", () => {
    const { getByRole, rerender } = render(
      <Button variant="dark">Test</Button>
    );

    expect(getByRole("button").className).toMatch(/Button-dark/);

    rerender(<Button variant="light">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-light/);

    rerender(<Button variant="pink-dark">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-pink-dark/);

    rerender(<Button variant="pink-light">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-pink-light/);

    rerender(<Button variant="grey-dark">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-grey-dark/);

    rerender(<Button variant="grey-light">Test</Button>);

    expect(getByRole("button").className).toMatch(/Button-grey-light/);
  });

  it("renders with added classes", () => {
    const { getByRole } = render(
      <Button variant="dark" className="bingo">
        Test
      </Button>
    );

    expect(getByRole("button").className).toMatch(/Button/);
    expect(getByRole("button").className).toMatch(/bingo/);
  });

  it("forwards extra props", () => {
    const { getByRole } = render(
      <Button variant="dark" role="link">
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
        <LinkButton variant="dark" ref={testRef} to="/test">
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
        <LinkButton variant="dark" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-dark/);

    rerender(
      <Router history={history}>
        <LinkButton variant="light" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-light/);

    rerender(
      <Router history={history}>
        <LinkButton variant="pink-dark" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-pink-dark/);

    rerender(
      <Router history={history}>
        <LinkButton variant="pink-light" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-pink-light/);

    rerender(
      <Router history={history}>
        <LinkButton variant="grey-dark" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-grey-dark/);

    rerender(
      <Router history={history}>
        <LinkButton variant="grey-light" to="/test">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("link").className).toMatch(/Button-grey-light/);
  });

  it("renders with added classes", () => {
    const history = createMemoryHistory();
    const { getByRole } = render(
      <Router history={history}>
        <LinkButton variant="dark" to="/test" className="bingo">
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
        <LinkButton variant="dark" to="/test" role="button">
          Test
        </LinkButton>
      </Router>
    );

    expect(getByRole("button")).toHaveTextContent(/Test/);
  });
});
