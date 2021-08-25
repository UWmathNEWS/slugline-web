/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen
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

import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import Hero from "../shared/components/Hero";
import Breadcrumbs from "../shared/components/Breadcrumbs";
import { Col, Row } from "react-bootstrap";
import { IssueCover } from "../shared/components/IssueCover";
import {
  setThemeVariables,
  resetThemeVariables,
  useTheme,
  inverseMode,
} from "../shared/contexts/ThemeContext";

import type { Issue, RouteComponentProps } from "../shared/types";
import { withSSRData } from "../shared/hoc/withSSRData";

const IssuePageContent: React.FC<{
  data: Issue;
  title: string;
  location: string;
}> = ({ data: issue, title, location }) => {
  const { mode } = useTheme();

  // special cleanup
  useEffect(() => resetThemeVariables, []);

  useEffect(() => {
    setThemeVariables({
      secondaryBg: `var(--paper-${issue.colour}-${mode})`,
      secondaryLink: `var(--paper-${issue.colour}-${inverseMode[mode]})`,
    });
  }, [mode, issue]);

  return (
    <>
      <Visor
        key="visor"
        title={title}
        titleParams={[issue.volume_num, issue.issue_code]}
        location={location}
      />
      <Hero variant="theme">
        <Breadcrumbs
          items={[
            {
              to: "/issues",
              content: "Issues",
            },
          ]}
        />
        <h1>{`Volume ${issue.volume_num} Issue ${issue.issue_code}`}</h1>
      </Hero>
      <div className="container mt-5">
        <Row>
          <Col lg={3}>
            <IssueCover issue={issue} />
          </Col>
        </Row>
      </div>
    </>
  );
};

const IssuePageLoading: React.FC<{
  location: string;
}> = ({ location }) => {
  return (
    <>
      <Visor key="visor" location={location} />
      <Loader variant="spinner" />
    </>
  );
};

const IssuePage: React.FC<RouteComponentProps<any, Issue>> = ({
  route,
  location,
  staticContext,
}) => {
  const params = useParams<{ issue_id: string }>();
  const fetchIssue = useCallback(() => route.loadData!({ params }), [
    params,
    route.loadData,
  ]);

  const RenderedComponent = withSSRData(
    [fetchIssue, staticContext?.data],
    IssuePageContent,
    undefined,
    IssuePageLoading
  );

  return <RenderedComponent title={route.title} location={location.pathname} />;
};

export default IssuePage;
