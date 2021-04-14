import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Issue, Pagination, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import { RequestState } from "../api/hooks";
import Loader from "../shared/components/Loader";
import ErrorPage from "../shared/errors/ErrorPage";
import { useSSRData } from "../shared/hooks";
import { coverSrc } from "../shared/helpers";
import Hero from "../shared/components/Hero";
import Breadcrumbs from "../shared/components/Breadcrumbs";

import "./styles/IssuesList.scss";

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
              <div
                className="VolumeIssue_imgWrapper mb-2"
                style={{
                  backgroundColor: `var(--paper-${issue.colour})`,
                }}
              >
                <img
                  className="VolumeIssue_img"
                  srcSet={`${coverSrc(issue, 1)}, ${coverSrc(issue, 2)} 2x`}
                  src={coverSrc(issue, 1)}
                  alt={`Volume ${issue.volume_num} Issue ${issue.issue_code} cover`}
                />
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

const IssuesList: React.FC<RouteComponentProps<any, Pagination<Issue>>> = ({
  route,
  location,
  staticContext,
}) => {
  const [volumes, dataInfo, fail] = useSSRData(
    useCallback(() => route.loadData!({}), [route.loadData]),
    staticContext?.data ? issuesToVolumes(staticContext.data) : [],
    issuesToVolumes
  );

  if (fail) {
    return <ErrorPage statusCode={dataInfo.statusCode || 500} />;
  }

  return (
    <>
      <Visor title={route.title} location={location.pathname} />
      <Hero variant="primary">
        <Breadcrumbs items={[]} />
        <h1>Issues</h1>
      </Hero>
      <div className="container mt-5">
        {dataInfo.state === RequestState.Running ? (
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

export default IssuesList;
