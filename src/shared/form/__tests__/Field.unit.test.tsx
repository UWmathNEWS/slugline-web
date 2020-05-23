import React from "react";
import { render } from "@testing-library/react";
import Field from "../Field";
import ERRORS from "../../errors";

describe("Field", () => {
  const error = {
    test: {
      type: "server_error",
      message: "__TESTING"
    }
  };
  // NOTE: This isn't completely accurate, but it's what makes TypeScript complain the least.
  // Hopefully as types improve over time, we can narrow this down.
  let ref: React.Ref<any>;

  beforeEach(() => {
    ref = React.createRef();
  });

  it("displays an input field (sanity check)", () => {
    const { getByRole } = render(<Field name="test" ref={ref} errors={{}} />);

    expect(getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards attributes", () => {
    const { getByRole } = render(<Field name="test" ref={ref} errors={{}} data-test="test" />);

    expect(getByRole("textbox").dataset.test).toBe("test");
  });

  it("displays errors if there are any", () => {
    const { container, getByRole, rerender } = render(<Field name="test" ref={ref} errors={{}} />);

    expect(container.querySelector(".invalid-feedback")).not.toBeInTheDocument();
    expect(getByRole("textbox").classList.contains("is-invalid")).toBe(false);

    rerender(<Field name="test" ref={ref} errors={error} />);

    expect(container.querySelector(".invalid-feedback")).toHaveTextContent(ERRORS.__TESTING);
    expect(getByRole("textbox").classList.contains("is-invalid")).toBe(true);
  });

  it("does not display errors if hideErrorMessage is true", () => {
    const { container } = render(<Field name="test" ref={ref} errors={error} hideErrorMessage />);

    expect(container.querySelector(".invalid-feedback")).not.toBeInTheDocument();
  });

  it("can display multiple errors at a time", () => {
    const error = {
      test: {
        types: {
          a: "__TESTING",
          b: "__TEST.__NESTED"
        }
      }
    };
    const { container, getByRole } = render(<Field name="test" ref={ref} errors={error} />);

    expect(container.querySelectorAll(".invalid-feedback.d-block").length).toBe(2);
    expect(container.querySelectorAll(".invalid-feedback")[1]).toHaveTextContent(ERRORS.__TEST.__NESTED);
    expect(getByRole("textbox").classList.contains("is-invalid")).toBe(true);
  });

  it("displays valid messages", () => {
    const { container, getByRole, rerender } = render(<Field name="test" ref={ref} errors={{}} />);

    expect(container.querySelector(".valid-feedback")).not.toBeInTheDocument();
    expect(getByRole("textbox").classList.contains("is-valid")).toBe(false);

    rerender(<Field name="test" ref={ref} errors={{}} validMessage="test" />);

    expect(container.querySelector(".valid-feedback")).toHaveTextContent("test");
    expect(getByRole("textbox").classList.contains("is-valid")).toBe(true);
  })
});
