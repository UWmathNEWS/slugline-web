import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { ErrorPage } from "../ErrorPage";
import ERRORS from "../../errors";

describe("ErrorPage", () => {
  it("returns the correct error page", () => {
    let apiError = {
      status_code: 404,
      error: ERRORS.__TESTING,
    };
    const { getAllByRole, rerender } = render(<ErrorPage error={apiError}/>, { wrapper: MemoryRouter });

    expect(getAllByRole("heading").filter(el => /404/.test(el.textContent!)).length)
      .toBeGreaterThan(0);

    apiError.status_code = 500;

    rerender(<ErrorPage error={apiError}/>);

    expect(getAllByRole("heading").filter(el => /500/.test(el.textContent!)).length)
      .toBeGreaterThan(0);
  });
});
