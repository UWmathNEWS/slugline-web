import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getIssue, Issue } from "../api/api";

const IssuePage = () => {

    const { issue_id } = useParams();
    const [issue, setIssue] = useState<Issue | null>(null);

    useEffect(() => {
        const id = Number(issue_id);
        if (id) {
            getIssue(id).then(resp => {
                setIssue(resp.data);
            })
        }
    }, [issue_id]);

    return issue && (
        <h1>{`Volume ${issue.volume_num} Issue ${issue.issue_num}`}</h1>
    )
}

export default IssuePage;
