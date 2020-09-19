import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Paginator, { PaginatorItem } from "../Paginator";
import { Pagination } from "../../types";

describe("PaginatorItem", () => {
  it("renders added classes", () => {
    const { container } = render(
      <PaginatorItem to="/test" className="bingo">
        Test
      </PaginatorItem>,
      { wrapper: MemoryRouter }
    );

    expect(container.querySelector(".Paginator_item")?.className).toMatch(
      /bingo/
    );
  });

  it("forwards props", () => {
    const { getByRole } = render(
      <PaginatorItem to="/test" role="button">
        Test
      </PaginatorItem>,
      { wrapper: MemoryRouter }
    );

    expect(getByRole("button")).toHaveTextContent(/Test/);
  });
});

describe("Paginator", () => {
  const pagination: Pagination<number> = Object.freeze({
    count: 3,
    page: 2,
    num_pages: 3,
    next: "",
    previous: "",
    results: [1, 2, 3],
  });

  it("renders added classes", () => {
    const { container } = render(
      <Paginator className="bingo">Test</Paginator>,
      { wrapper: MemoryRouter }
    );

    expect(container.querySelector(".Paginator")?.className).toMatch(/bingo/);
  });

  it("forwards props", () => {
    const { getByTestId } = render(
      <Paginator data-testid="p">Test</Paginator>,
      { wrapper: MemoryRouter }
    );

    expect(getByTestId("p")).toHaveTextContent(/Test/);
  });

  it("renders automatically when given a pagination input", () => {
    const { container, getByLabelText, getByText } = render(
      <Paginator pagination={pagination} url={() => ""} />,
      { wrapper: MemoryRouter }
    );

    // 3 pages + prev/next = 5
    expect(container.querySelectorAll(".Paginator_item").length).toBe(5);
    expect(getByLabelText(/previous/i)).toBeInTheDocument();
    expect(getByLabelText(/next/i)).toBeInTheDocument();
    expect(getByLabelText(/2/).closest(".Paginator_item")!.className).toMatch(
      "Paginator_current"
    );

    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("3")).toBeInTheDocument();
  });

  it("calls the provided url function with the desired page on navigation request", async () => {
    const url = jest.fn((page) => `${page}`);
    render(<Paginator pagination={pagination} url={url} />, {
      wrapper: MemoryRouter,
    });

    expect(url).toHaveBeenCalledTimes(5);
    expect(url).toHaveBeenCalledWith(1);
    expect(url).toHaveBeenCalledWith(2);
    expect(url).toHaveBeenCalledWith(3);
  });

  it("doesn't render prev button on first page", () => {
    const { queryByLabelText } = render(
      <Paginator pagination={{ ...pagination, page: 1 }} url={() => ""} />,
      { wrapper: MemoryRouter }
    );

    expect(queryByLabelText(/previous/i)).not.toBeInTheDocument();
  });

  it("doesn't render next button on last page", () => {
    const { queryByLabelText } = render(
      <Paginator
        pagination={{ ...pagination, page: 3 }}
        url={() => ""}
        data-testid="p"
      />,
      { wrapper: MemoryRouter }
    );

    expect(queryByLabelText(/next/i)).not.toBeInTheDocument();
  });

  it("Collapses when there are many pages", () => {
    const { getAllByLabelText, getByText } = render(
      <Paginator
        pagination={{ ...pagination, page: 8, num_pages: 16 }}
        url={() => ""}
      />,
      { wrapper: MemoryRouter }
    );

    // page 1 + page 7/8/9 + page 26 = 5
    expect(getAllByLabelText(/go to/i).length).toBe(5);
    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("7")).toBeInTheDocument();
    expect(getByText("8")).toBeInTheDocument();
    expect(getByText("9")).toBeInTheDocument();
    expect(getByText("16")).toBeInTheDocument();
  });
});
