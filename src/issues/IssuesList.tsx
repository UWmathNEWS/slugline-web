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

import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Issue, Pagination, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import Hero from "../shared/components/Hero";
import Breadcrumbs from "../shared/components/Breadcrumbs";

import "./styles/IssuesList.scss";
import { IssueCover } from "../shared/components/IssueCover";
import { withSSRData } from "../shared/hoc/withSSRData";

export interface VolumeIssuesProps {
  volume: Issue[];
}

const VolumeIssues: React.FC<VolumeIssuesProps> = (props) => {
  return (
    <>
      <h2 className="h5 mb-3">Volume {props.volume[0].volume_num}</h2>
      <div className="VolumeIssues_list mb-4">
        {props.volume.map((issue) => {
          return (
            <Link
              to={{
                pathname: `/issues/${issue.id}`,
                state: issue,
              }}
              className="VolumeIssue"
              key={issue.id}
            >
              <div className="mb-2">
                <IssueCover issue={issue} useBackground />
              </div>
              <p className="VolumeIssue_number h6 text-center">{`Issue ${issue.issue_code}`}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
};

const issuesToVolumes = (paginatedIssues: Pagination<Issue>): Issue[][] => {
  const issues = paginatedIssues.results;

  if (issues.length === 0) {
    return [];
  }

  let vols: Issue[][] = [[]];
  let volumeNum = issues[0].volume_num;

  // split the issues into groups by volume num
  issues.forEach((issue) => {
    if (issue.volume_num !== volumeNum) {
      vols.push([]);
    }
    vols[vols.length - 1].push(issue);
    volumeNum = issue.volume_num;
  });

  return vols;
};

const IssuesListContent: React.FC<{
  data: Issue[][];
  isLoading: boolean;
  title: string;
  location: string;
}> = ({ data: volumes, isLoading, title, location }) => {
  return (
    <>
      <Visor title={title} location={location} />
      <Hero variant="theme">
        <Breadcrumbs items={[]} />
        <h1>Issues</h1>
      </Hero>
      <div className="container mt-5">
        {isLoading ? (
          <Loader variant="spinner" />
        ) : (
          volumes.map((volume, i) => {
            return <VolumeIssues key={i} volume={volume} />;
          })
        )}
      </div>
    </>
  );
};

const IssuesList: React.FC<RouteComponentProps<any, Pagination<Issue>>> = ({
  route,
  location,
  staticContext,
}) => {
  const fetchVolumes = useCallback(() => route.loadData!({}), [route.loadData]);
  const RenderedComponent = withSSRData(
    [
      fetchVolumes,
      staticContext?.data ? issuesToVolumes(staticContext.data) : [],
      issuesToVolumes,
    ],
    IssuesListContent
  );

  return <RenderedComponent title={route.title} location={location.pathname} />;
};

export default IssuesList;
