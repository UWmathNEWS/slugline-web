import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { format } from "date-fns";
import { testIssue } from "../../test-utils";
import IssueEntry, { IssueEntryHero } from "../IssueEntry";

describe("IssueEntry", () => {
  it("renders with publish date if given", () => {
    const { getByText } = render(
      <IssueEntry
        issue={{ ...testIssue, publish_date: "2020-01-01" }}
        tagline="bingobangobongo"
      />,
      { wrapper: MemoryRouter }
    );
    expect(getByText(/bingobangobongo/).textContent).toMatch(
      format(new Date("2020-01-01"), "d MMM y")
    );
  });

  it("renders with current date if publish date is not given", () => {
    const { getByText } = render(
      <IssueEntry issue={testIssue} tagline="bingobangobongo" />,
      { wrapper: MemoryRouter }
    );
    expect(getByText(/bingobangobongo/).textContent).toMatch(
      format(new Date(), "d MMM y")
    );
  });

  it("hides footer if specified", () => {
    const { container, rerender } = render(
      <IssueEntry issue={testIssue} tagline="" />,
      { wrapper: MemoryRouter }
    );
    expect(container.querySelector(".IssueEntry_footer")).toBeInTheDocument();

    rerender(<IssueEntry issue={testIssue} tagline="" showFooter={false} />);

    expect(
      container.querySelector(".IssueEntry_footer")
    ).not.toBeInTheDocument();
  });

  it("title should point to issue page", () => {
    const { getByText } = render(<IssueEntry issue={testIssue} tagline="" />, {
      wrapper: MemoryRouter,
    });
    expect(getByText(testIssue.title!).getAttribute("href")).toMatch(
      `issues/${testIssue.id}`
    );
  });
});

describe("IssueEntryHero", () => {
  it("renders with passed-in classes", () => {
    const { container } = render(
      <IssueEntryHero issue={testIssue} tagline="" className="bingo" />,
      { wrapper: MemoryRouter }
    );
    expect(container.querySelector(".IssueEntry")!.className).toMatch(/bingo/);
  });

  it("shows cover image when specified", () => {
    const { queryByAltText, rerender } = render(
      <IssueEntryHero issue={testIssue} tagline="" />,
      { wrapper: MemoryRouter }
    );
    expect(queryByAltText(/cover/i)).not.toBeInTheDocument();

    rerender(<IssueEntryHero issue={testIssue} tagline="" showCover />);
    expect(queryByAltText(/cover/i)).toBeInTheDocument();
  });
});
