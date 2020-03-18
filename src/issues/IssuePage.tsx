import React from "react";
import { useParams } from "react-router-dom";
import { useIssue } from "../api/api";

const IssuePage = () => {
  const { issue_id } = useParams();
  const [issue, issueErrors] = useIssue(Number(issue_id));

  if (issue) {
    return <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_num}`}</h1>;
  } else {
    return <h1>LOADING...</h1>;
  }
};

export default IssuePage;
