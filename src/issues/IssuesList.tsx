import React, { useEffect, useState } from "react";

import "./styles/IssuesList.scss";
import { Link } from "react-router-dom";
import { Issue, Pagination, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import { RequestState, useAPILazy } from "../api/hooks";
import api from "../api/api";
import Loader from "../shared/components/Loader";
import { ErrorPage } from "../shared/errors/ErrorPage";

export interface VolumeIssuesProps {
  volume: Issue[];
}

const IMG_DEFAULT =
  "https://i.kinja-img.com/gawker-media/image/upload/c_scale,f_auto,fl_progressive,q_80,w_1600/gynfui2kgjtnzdwlsxqy.jpg";

const VolumeIssues = (props: VolumeIssuesProps) => {
  return (
    <>
      <h5 className="blackbox">Volume {props.volume[0].volume_num}</h5>
      <div className="volume-issue-list d-flex overflow-auto">
        {props.volume.map((issue) => {
          return (
            <Link
              to={{
                pathname: `/issues/${issue.id}`,
                state: issue,
              }}
              className="volume-issue flex-shrink-1"
              key={issue.id}
            >
              <img
                className="volume-issue-img mb-1"
                src={IMG_DEFAULT}
                alt={`Volume ${issue.volume_num} Issue ${issue.issue_code} cover`}
              />
              <h6 className="text-center">{`Issue ${issue.issue_code}`}</h6>
            </Link>
          );
        })}
      </div>
    </>
  );
};

const issuesToVolumes = (issues: Issue[]): Issue[][] => {
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

const IssuesList: React.FC<RouteComponentProps<any, Pagination<Issue>>> = (
  props
) => {
  const [getIssues, getIssuesInfo] = useAPILazy(api.issues.list);
  const [volumes, setVolumes] = useState<Issue[][]>(
    props.staticContext?.data
      ? issuesToVolumes(props.staticContext.data.results)
      : []
  );
  const [statusCode, setStatusCode] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      if (window.__SSR_DIRECTIVES__.STATUS_CODE) {
        setStatusCode(window.__SSR_DIRECTIVES__.STATUS_CODE);
        delete window.__SSR_DIRECTIVES__.STATUS_CODE;
        return;
      }
      if (window.__SSR_DIRECTIVES__.DATA) {
        setVolumes(issuesToVolumes(window.__SSR_DIRECTIVES__.DATA.results));
        delete window.__SSR_DIRECTIVES__.DATA;
      } else {
        getIssues().then((resp) => {
          if (resp.success) {
            setVolumes(issuesToVolumes(resp.data.results));
          }
        });
      }
    }, 0);
  }, [getIssues]);

  if (statusCode) {
    return <ErrorPage statusCode={statusCode} />;
  }

  return (
    <>
      <Visor
        title={
          getIssuesInfo.state === RequestState.Running
            ? "Loading..."
            : props.route.title
        }
        location={props.location.pathname}
      />
      <h1>Issues</h1>
      {getIssuesInfo.state === RequestState.Running ? (
        <Loader variant="spinner" />
      ) : (
        volumes.map((volume, i) => {
          return <VolumeIssues key={i} volume={volume} />;
        })
      )}
    </>
  );
};

export default IssuesList;
