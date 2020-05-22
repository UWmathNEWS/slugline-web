import React from "react";
import { render } from "@testing-library/react";
import NonFieldErrors from "../NonFieldErrors";
import ERRORS from "../../errors";

describe("NonFieldErrors", () => {
  it("displays errors", () => {
    const { container } = render(
      <NonFieldErrors errors={["__TESTING", "__TEST.__NESTED"]} />
    );
    const [err1, err2] = Array.from(container.querySelectorAll(".invalid-feedback"));
    expect(err1.classList.contains("d-block")).toBe(true);
    expect(err1).toHaveTextContent(ERRORS.__TESTING);
    expect(err2.classList.contains("d-block")).toBe(true);
    expect(err2).toHaveTextContent(ERRORS.__TEST.__NESTED);
  });
});
