import React, { useState, useEffect } from 'react';
import { Issue, getAllIssues } from '../api/api';

import './issues_list.scss';
import { useRouteMatch, Link } from 'react-router-dom';

export interface VolumeIssuesProps {
    volume: Issue[];
}

const IMG_DEFAULT = 'https://i.kinja-img.com/gawker-media/image/upload/c_scale,f_auto,fl_progressive,q_80,w_1600/gynfui2kgjtnzdwlsxqy.jpg';

const VolumeIssues = (props: VolumeIssuesProps) => {
    let { path, url } = useRouteMatch();

    return (
        <>
            <h5 className="blackbox">Volume {props.volume[0].volume_num}</h5>
            <div className="volume-issue-list d-flex overflow-auto">
                {props.volume.map(issue => {
                    return (
                        <Link to={`/issues/${issue.id}`} className="volume-issue flex-shrink-1" key={issue.id}>
                            <img className="volume-issue-img mb-1" src={IMG_DEFAULT} />
                            <h6 className="text-center">{`Issue ${issue.issue_num}`}</h6>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}

const IssuesList = () => {

    const [volumes, setVolumes] = useState<Issue[][]>([]);

    useEffect(() => {
        getAllIssues().then(resp => {
            const issues = resp.data;
            let vols: Issue[][] = [ [] ];
            let volumeNum = issues[0].volume_num;
            // split the issues into groups by volume num
            issues.forEach(issue => {
                if (issue.volume_num !== volumeNum) {
                    vols.push([]);
                }
                vols[vols.length - 1].push(issue);
                volumeNum = issue.volume_num;
            });
            setVolumes(vols);
        });
    }, []);

    return (
        <>
            <h1>Issues</h1>
            {volumes.map(volume => {
                return <VolumeIssues volume={volume}/>
            })}
        </>
    )
}

export default IssuesList;
