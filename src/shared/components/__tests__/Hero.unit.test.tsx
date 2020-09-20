import React from "react";
import { render } from "@testing-library/react";
import Hero from "../Hero";

describe("Hero", () => {
  it("renders different variants accordingly", () => {
    const { container, rerender } = render(<Hero variant="primary">Test</Hero>);

    expect(container.firstElementChild!.className).toMatch("Hero--primary");

    rerender(<Hero variant="light">Test</Hero>);

    expect(container.firstElementChild!.className).toMatch("Hero--light");
  });

  it("renders with passed-in classes", () => {
    const { container } = render(
      <Hero variant="primary" className="bingo">
        Test
      </Hero>
    );

    expect(container.firstElementChild!.className).toMatch(/Hero/);
    expect(container.firstElementChild!.className).toMatch(/bingo/);
  });
});
