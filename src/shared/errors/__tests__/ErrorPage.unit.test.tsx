import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import ErrorPage from "../ErrorPage";

describe("ErrorPage", () => {
  it("returns the correct error page", () => {
    const { getAllByRole, rerender } = render(<ErrorPage statusCode={404} />, {
      wrapper: MemoryRouter,
    });

    expect(
      getAllByRole("heading").filter((el) => /404/.test(el.textContent!)).length
    ).toBeGreaterThan(0);

    rerender(<ErrorPage statusCode={500} />);

    expect(
      getAllByRole("heading").filter((el) => /500/.test(el.textContent!)).length
    ).toBeGreaterThan(0);
  });
});
