import React from "react";
import { render } from "@testing-library/react";
import Dateline from "../Dateline";

describe("Dateline", () => {
  it("renders with passed-in classes", () => {
    const { getByText } = render(<Dateline className="bingo">Test</Dateline>);

    expect(getByText("Test").className).toMatch(/Dateline/);
    expect(getByText("Test").className).toMatch(/bingo/);
  });

  it("forwards props", () => {
    const { getByRole } = render(<Dateline role="heading">Test</Dateline>);

    expect(getByRole("heading")).toHaveTextContent(/Test/);
  });
});
