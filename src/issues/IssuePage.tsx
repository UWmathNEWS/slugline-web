import React from "react";
import { useParams } from "react-router-dom";
import { useIssue } from "../api/hooks";
import { RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";

const IssuePage: React.FC<RouteComponentProps> = ({ route, location }) => {
  const { issue_id } = useParams();
  const [issue, ,] = useIssue(issue_id);

  if (issue) {
    return (
      <>
        <Visor
          key="visor"
          title={route.title}
          titleParams={[issue?.volume_num, issue?.issue_code]}
          location={location.pathname}
        />
        <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_code}`}</h1>
      </>
    );
  } else {
    return (
      <>
        <Visor key="visor" title="Loading..." location={location.pathname} />
        <Loader variant="spinner" />
      </>
    );
  }
};

export default IssuePage;
