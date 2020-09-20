import React from "react";
import type { ForwardAttributes, Issue } from "../types";
import Dateline from "./Dateline";
import format from "date-fns/format";
import { Link } from "react-router-dom";
import ActionLink from "./ActionLink";
import { LinkButton } from "./Button";
import { coverSrc } from "../helpers";

import "./styles/IssueEntry.scss";

interface IssueEntryPropsBase {
  issue: Issue;
}

export interface IssueEntryProps extends IssueEntryPropsBase {
  tagline?: string;
  showFooter?: boolean;
}

export interface IssueEntryHeroProps extends IssueEntryPropsBase {
  tagline?: string;
  showCover?: boolean;
}

const IssueEntry: React.FC<IssueEntryProps & ForwardAttributes> = ({
  issue,
  tagline,
  showFooter,
  className,
}) => {
  return (
    <div className={`IssueEntry ${className || ""}`}>
      <Dateline>
        {tagline || `Volume ${issue.volume_num} Issue ${issue.issue_code}`}{" "}
        &bull; {format(new Date(issue.publish_date || Date.now()), "d MMM y")}
      </Dateline>
      <h2 className="IssueEntry_title mt-1">
        <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
      </h2>
      <div className="IssueEntry_description mt-3">{issue.description}</div>
      {(showFooter === undefined || showFooter) && (
        <div className="IssueEntry_footer mt-3">
          <ActionLink to={`/issues/${issue.id}`} className="IssueEntry_cta">
            Read Volume {issue.volume_num} Issue {issue.issue_code}
          </ActionLink>
        </div>
      )}
    </div>
  );
};

export const IssueEntryHero: React.FC<
  IssueEntryHeroProps & ForwardAttributes
> = ({ issue, tagline, showCover, className }) => {
  if (showCover) {
    return (
      <>
        <div className="d-flex flex-column mr-5">
          <IssueEntry
            issue={issue}
            tagline={tagline}
            className={`IssueEntry--hero ${className || ""}`}
            showFooter={false}
          />
          <div className="flex-fill" />
          <div className="mt-3">
            <LinkButton
              to={`/issues/${issue.id}`}
              variant="dark"
              className="IssueEntry_cta"
            >
              Read Volume {issue.volume_num} Issue {issue.issue_code}
            </LinkButton>
          </div>
        </div>
        {issue.pdf && (
          <div className="ml-auto">
            <Link
              to={`/issues/${issue.id}`}
              className="d-inline-block"
              style={{
                backgroundColor: `var(--paper-${issue.colour})`,
              }}
            >
              <img
                alt={`Cover of Volume ${issue.volume_num} Issue ${issue.issue_code}`}
                className="Hero_coverImg"
                srcSet={`${coverSrc(issue, 1)}, ${coverSrc(issue, 2)} 2x`}
                src={coverSrc(issue, 1)}
              />
            </Link>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        <IssueEntry
          issue={issue}
          tagline={tagline}
          className={`IssueEntry--hero ${className || ""}`}
          showFooter={false}
        />
        <div className="mt-3">
          <LinkButton
            to={`/issues/${issue.id}`}
            variant="dark"
            className="IssueEntry_cta"
          >
            Read Volume {issue.volume_num} Issue {issue.issue_code}
          </LinkButton>
        </div>
      </>
    );
  }
};

export default IssueEntry;
