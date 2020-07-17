import React from "react";
import { render } from "@testing-library/react";
import Loader from "../Loader";

describe("Loader", () => {
  describe("spinner", () => {
    it("renders with status role", () => {
      const { getByRole } = render(<Loader variant="spinner" />);

      expect(getByRole("status")).toBeInTheDocument();
    });

    it("renders with screenreader text if not hidden", () => {
      const { queryByText, rerender } = render(<Loader variant="spinner" />);

      expect(queryByText(/Loading/)).toBeInTheDocument();

      rerender(<Loader variant="spinner" hideFromScreenreaders={true} />);

      expect(queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it("renders with provided className, if any", () => {
      const { container } = render(
        <Loader variant="spinner" className="testing abcd" />
      );

      expect(container.querySelector(".testing.abcd")).toBeInTheDocument();
    });
  });

  describe("linear", () => {
    it("renders with status role", () => {
      const { getByRole } = render(<Loader variant="linear" />);

      expect(getByRole("status")).toBeInTheDocument();
    });

    it("renders with screenreader text if not hidden", () => {
      const { queryByText, rerender } = render(<Loader variant="linear" />);

      expect(queryByText(/Loading/)).toBeInTheDocument();

      rerender(<Loader variant="linear" hideFromScreenreaders={true} />);

      expect(queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it("renders with provided className, if any", () => {
      const { container } = render(
        <Loader variant="linear" className="testing abcd" />
      );

      expect(container.querySelector(".testing.abcd")).toBeInTheDocument();
    });
  });

  it("renders nothing if invalid variant provided", () => {
    // @ts-ignore
    const { container } = render(<Loader variant="invalid" />);

    expect(container).toBeEmptyDOMElement();
  });
});
