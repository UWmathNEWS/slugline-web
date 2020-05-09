import React from "react";
import { useParams } from "react-router-dom";
import { useIssue } from "../api/hooks";

const IssuePage = () => {
  const { issue_id } = useParams();
  const [issue, ,] = useIssue(issue_id);

  if (issue) {
    return <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_code}`}</h1>;
  } else {
    return <h1>LOADING...</h1>;
  }
};

export default IssuePage;
