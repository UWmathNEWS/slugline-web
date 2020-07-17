import React from "react";
import { render } from "@testing-library/react";
import AtLeast from "../AtLeast";
import * as user from "../../helpers/user";

describe("AtLeast", () => {
  const atLeastSpy = jest.spyOn(user, "atLeast");

  afterEach(() => {
    atLeastSpy.mockReset();
  });

  it("calls helpers.user.atLeast", () => {
    render(<AtLeast role="Contributor" />);

    expect(atLeastSpy).toHaveBeenCalled();
  });

  it("renders the child component if the call to atLeast succeeded", () => {
    atLeastSpy.mockImplementation(() => true);

    const { getByText } = render(<AtLeast role="Editor">Test</AtLeast>);

    expect(getByText("Test")).toBeInTheDocument();
  });

  it("renders the error component or nothing if the call to atLeast failed", () => {
    atLeastSpy.mockImplementation(() => false);

    const { getByText } = render(
      <AtLeast role="Editor" errorComponent={<>Error</>}>
        Test
      </AtLeast>
    );

    expect(getByText("Error")).toBeInTheDocument();

    const { container } = render(<AtLeast role="Editor">Test</AtLeast>);

    expect(container).toBeEmptyDOMElement();
  });
});
