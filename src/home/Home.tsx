import React, { useCallback, useMemo } from "react";
import Visor from "../shared/components/Visor";
import {
  ForwardAttributes,
  Issue,
  Pagination,
  RouteComponentProps,
} from "../shared/types";
import { useSSRData } from "../shared/hooks";
import api, { combine } from "../api/api";
import { RequestState } from "../api/hooks";
import ErrorPage from "../shared/errors/ErrorPage";
import Loader from "../shared/components/Loader";
import Dateline from "../shared/components/Dateline";

import "./styles/Home.scss";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { cover_src } from "../shared/helpers";

const IssueEntry: React.FC<{ issue: Issue } & ForwardAttributes> = ({
  issue,
  className,
}) => {
  return (
    <div className={className}>
      <Dateline>
        Volume {issue.volume_num} Issue {issue.issue_code} &bull;{" "}
        {issue.publish_date}
      </Dateline>
      <h2>
        <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
      </h2>
      <div>{issue.description}</div>
      <a href={issue.pdf}>
        Read Volume {issue.volume_num} Issue {issue.issue_code}
      </a>
    </div>
  );
};

/**
 * The component for our home page.
 *
 * @param route
 * @param location
 * @param staticContext
 * @constructor
 */

const Home: React.FC<RouteComponentProps<any, [Pagination<Issue>, Issue]>> = ({
  route,
  location,
  staticContext,
}) => {
  const search = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);
  const page = parseInt(search.get("page") || "") || 1;
  const [resp, reqInfo, fail] = useSSRData(
    useCallback(
      () =>
        combine(
          api.published_issues.list({
            params: { page },
          }),
          api.published_issues.latest()
        ),
      [page]
    ),
    staticContext?.data
  );

  if (!fail && resp && reqInfo.state !== RequestState.Running) {
    const [issues, latest_issue] = resp;

    // On the first page, we want a full latest issue hero. However, on subsequent pages, we want a more subtle hero.
    if (page === 1) {
      const issues_rest = issues.results.filter(
        (issue) =>
          issue.volume_num !== latest_issue.volume_num &&
          issue.issue_code !== latest_issue.issue_code
      );
      return (
        <>
          <Visor key="visor" title="" />
          <Helmet>
            <style>
              {`.SluglineNav {
              --background-clr: var(--paper-${latest_issue.colour}-light) !important;
            }`}
            </style>
          </Helmet>
          <div
            className="Hero"
            style={{
              backgroundColor: `var(--paper-${latest_issue.colour}-light)`,
            }}
          >
            <div className="container clearfix">
              <IssueEntry issue={latest_issue} className="float-lg-left" />
              {latest_issue.pdf && (
                <div className="float-lg-right">
                  <div
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
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="container">
            {issues_rest.map((issue, i) => (
              <IssueEntry key={i} issue={issue} />
            ))}
          </div>
        </>
      );
    } else {
      return (
        <>
          <Visor key="visor" title={`Page ${page}`} />
          <div className="container">
            {issues.results.map((issue, i) => (
              <IssueEntry key={i} issue={issue} />
            ))}
          </div>
        </>
      );
    }
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
