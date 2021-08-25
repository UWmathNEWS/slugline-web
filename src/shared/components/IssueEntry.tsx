/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import type { ForwardAttributes, Issue } from "../types";
import Dateline from "./Dateline";
import format from "date-fns/format";
import { Link } from "react-router-dom";
import ActionLink from "./ActionLink";
import { LinkButton } from "./Button";

import "./styles/IssueEntry.scss";
import { IssueCover } from "./IssueCover";

interface IssueEntryPropsBase {
  issue: Issue;
}

interface IssueEntryProps extends IssueEntryPropsBase {
  tagline?: string;
  showFooter?: boolean;
}

interface IssueEntryHeroProps extends IssueEntryPropsBase {
  tagline?: string;
  showCover?: boolean;
}

export type { IssueEntryPropsBase, IssueEntryProps, IssueEntryHeroProps };

/**
 * Display an issue's metadata and link to its page.
 *
 * @param issue The issue to display
 * @param tagline A short (50 characters or less) line of flavour text
 * @param showFooter Show the footer?
 * @param className Additional classes to attach
 */
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

/**
 * Display an issue in a hero-friendly format. Parameters largely mirror that of IssueEntry.
 *
 * @param issue The issue to display
 * @param tagline A short line of flavour text
 * @param showCover Show the cover image to the right of the issue metadata?
 * @param className Additional classes to forward to IssueEntry
 */
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
            <Link to={`/issues/${issue.id}`} className="d-inline-block">
              <IssueCover issue={issue} useBackground />
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
