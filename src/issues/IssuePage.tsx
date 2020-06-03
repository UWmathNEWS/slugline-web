import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useIssue } from "../api/hooks";
import { RouteProps } from "../shared/helpers/renderRoutes";
import { makeTitle } from "../shared/helpers";

const IssuePage = ({ route }: { route: RouteProps }) => {
  const { issue_id } = useParams();
  const [issue, ,] = useIssue(issue_id);

  useEffect(() => {
    document.title = issue ? makeTitle(route.title, issue?.volume_num, issue?.issue_code) : makeTitle("Loading...");
  }, [issue]);

  if (issue) {
    return <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_code}`}</h1>;
  } else {
    return <h1>LOADING...</h1>;
  }
};

export default IssuePage;
