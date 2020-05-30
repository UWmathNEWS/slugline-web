import React, { useState, useEffect } from "react";
import { useAllIssues } from "../api/hooks";

import "./styles/IssuesList.scss";
import { Link } from "react-router-dom";
import { Issue } from "../shared/types";

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

const IssuesList = () => {
  const [issues, ,] = useAllIssues();
  const [volumes, setVolumes] = useState<Issue[][]>([]);

  useEffect(() => {
    if (issues?.results === undefined || issues?.results.length === 0) {
      return;
    }
    let vols: Issue[][] = [[]];
    let volumeNum = issues.results[0].volume_num;
    // split the issues into groups by volume num
    issues.results.forEach((issue) => {
      if (issue.volume_num !== volumeNum) {
        vols.push([]);
      }
      vols[vols.length - 1].push(issue);
      volumeNum = issue.volume_num;
    });
    setVolumes(vols);
  }, [issues]);

  return (
    <>
      <h1>Issues</h1>
      {volumes.map((volume) => {
        return <VolumeIssues volume={volume} />;
      })}
    </>
  );
};

export default IssuesList;
