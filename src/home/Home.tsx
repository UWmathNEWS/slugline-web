import React, { useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cover_src } from "../shared/helpers";
import {
  ForwardAttributes,
  Issue,
  Pagination,
  RouteComponentProps,
} from "../shared/types";
import { useSSRData } from "../shared/hooks";
import { RequestState } from "../api/hooks";
import ErrorPage from "../shared/errors/ErrorPage";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import Dateline from "../shared/components/Dateline";
import ActionLink from "../shared/components/ActionLink";
import { LinkButton } from "../shared/components/Button";

import "./styles/Home.scss";
import Paginator from "../shared/components/Paginator";

const taglines = [
  "Fresh off the press",
  "Recently proved to exist",
  "Newly conjectured",
  "Hot and ready",
  "Straight from the pizza oven",
  "Our latest and greatest",
  "Thank Mr. Goose it's here",
  "Now with 100% less fibre",
  "Start your addiction today",
  "Comes with free bikini",
  "Proof of Imprint's inferiority",
  "Bring the editors pizza day",
  "Pissing off Imprint since 1973",
  "The issue you've been waiting for",
  "Just pushed to master",
  "This issue broke prod",
  "#1 among Russian spambots",
  "Your statistically significant other",
  "P(You read this) = 1",
  "This issue > last issue",
  "Math is fun, but we are funnier",
  "Your assignment can wait",
  "Now with less math and even less news",
  "#1 cause of procrastination among mathematicians",
  "What if you read this issue…haha jk…unless?",
  "10/10 mathematicians recommend mathNEWS (n = 10)",
  "The Dean loves us, apparently",
  "Now with a chance of actual journalism",
  "Please read, for the jar of dirt in the office",
  "You came here for the profQUOTES, didn't you",
  "Made with copious amounts of coffee",
  "Proudly published from the 7th floor of MC",
  "I ran out of jokes",
];

const IssueEntryBody: React.FC<{
  issue: Issue;
  dateline: string;
}> = ({ issue, dateline }) => {
  return (
    <>
      <Dateline>
        {dateline} &bull;{" "}
        {format(new Date(issue.publish_date || Date.now()), "d MMM y")}
      </Dateline>
      <h2 className="IssueEntry_title mt-1">
        <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
      </h2>
      <div className="IssueEntry_description mt-3">{issue.description}</div>
    </>
  );
};

const IssueEntry: React.FC<{ issue: Issue } & ForwardAttributes> = ({
  issue,
  className,
}) => {
  return (
    <div className={`IssueEntry ${className || ""}`}>
      <IssueEntryBody
        issue={issue}
        dateline={`Volume ${issue.volume_num} Issue ${issue.issue_code}`}
      />
      <div className="mt-3">
        {/* TODO: When issue interface is changed, remove fallback */}
        <ActionLink to={issue.pdf || ""} className="IssueEntry_cta">
          Read Volume {issue.volume_num} Issue {issue.issue_code}
        </ActionLink>
      </div>
    </div>
  );
};

const HeroEntry: React.FC<
  { issue: Issue; tagline?: string } & ForwardAttributes
> = ({ issue, tagline, className }) => {
  return (
    <div className={`IssueEntry IssueEntry--hero ${className || ""}`}>
      <IssueEntryBody
        issue={issue}
        dateline={
          tagline ?? taglines[Math.floor(Math.random() * taglines.length)]
        }
      />
    </div>
  );
};

/**
 * The component for our home page.
 *
 * @param route The route in Public for the homepage
 * @param location The Location object from react-router
 * @param staticContext The static context passed from SSR
 */

const Home: React.FC<RouteComponentProps<any, [Pagination<Issue>, Issue]>> = ({
  route,
  location,
  staticContext,
}) => {
  const search = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);
  const page = parseInt(search.get("paged") || "") || 1;
  const [resp, reqInfo, fail] = useSSRData(
    useCallback(() => route.loadData!({ query: { paged: page } }), [
      page,
      route.loadData,
    ]),
    staticContext?.data
  );

  if (!fail && resp && reqInfo.state !== RequestState.Running) {
    let issues = resp[0];
    const latest_issue = resp[1];
    let title = "";
    let hero: React.ReactNode;

    // On the first page, we want a full latest issue hero. However, on subsequent pages, we want a more subtle hero.
    if (page === 1) {
      issues.results = issues.results.filter(
        (issue) =>
          issue.volume_num !== latest_issue.volume_num &&
          issue.issue_code !== latest_issue.issue_code
      );
      hero = (
        <div className="Hero Hero--full">
          <div className="container d-flex overflow-hidden">
            <div className="d-flex flex-column mr-5">
              <HeroEntry issue={latest_issue} />
              <div className="flex-fill" />
              <div className="Hero_cta mt-3">
                <LinkButton
                  to={`/issues/${latest_issue.id}`}
                  variant="dark"
                  className="IssueEntry_cta"
                >
                  Read Volume {latest_issue.volume_num} Issue{" "}
                  {latest_issue.issue_code}
                </LinkButton>
              </div>
            </div>
            {latest_issue.pdf && (
              <div className="ml-auto">
                <Link
                  to={`/issues/${latest_issue.id}`}
                  className="d-inline-block"
                  style={{
                    backgroundColor: `var(--paper-${latest_issue.colour})`,
                  }}
                >
                  <img
                    alt={`Cover of Volume ${latest_issue.volume_num} Issue ${latest_issue.issue_code}`}
                    className="Hero_coverImg"
                    srcSet={`${cover_src(latest_issue, 1)}, ${cover_src(
                      latest_issue,
                      2
                    )} 2x`}
                    src={cover_src(latest_issue, 1)}
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      title = `Page ${page}`;
      hero = (
        <div className="Hero Hero--short">
          <div className="container">
            <HeroEntry issue={latest_issue} tagline="Latest Issue" />
            <LinkButton
              to={`/issues/${latest_issue.id}`}
              variant="dark"
              className="IssueEntry_cta mt-3"
            >
              Read Volume {latest_issue.volume_num} Issue{" "}
              {latest_issue.issue_code}
            </LinkButton>
          </div>
        </div>
      );
    }
    return (
      <>
        <Visor key="visor" title={title} />
        <Helmet>
          {/* We want the navbar to share the issue's colour */}
          <style key="nav-style">
            {`.SluglineNav, .Hero {
              --background-clr: var(--paper-${latest_issue.colour}-light) !important;
            }`}
          </style>
        </Helmet>
        {hero}
        <div className="container mt-5">
          {issues.results.map((issue, i) => (
            <IssueEntry key={i} issue={issue} className="mb-5" />
          ))}
          <Paginator pagination={issues} url={(page) => `/?paged=${page}`} />
        </div>
      </>
    );
  } else if (fail) {
    return <ErrorPage statusCode={reqInfo.statusCode || 500} />;
  } else {
    return (
      <>
        <Visor key="visor" title="Loading..." location={location.pathname} />
        <Loader variant="spinner" />
      </>
    );
  }
};

export default Home;
