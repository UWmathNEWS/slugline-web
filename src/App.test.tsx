import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("render is not null ", () => {
  const { getByText } = render(<App />);
  expect(getByText).not.toBeNull();
});
