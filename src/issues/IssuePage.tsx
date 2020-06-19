import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Issue, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import { RequestState } from "../api/hooks";
import api from "../api/api";
import ErrorPage from "../shared/errors/ErrorPage";
import { useSSRData } from "../shared/hooks";

const IssuePage: React.FC<RouteComponentProps<any, Issue>> = ({
  route,
  location,
  staticContext,
}) => {
  const { issue_id: issueId } = useParams<{ issue_id: string }>();

  const [issue, issueInfo, fail] = useSSRData(
    useCallback(() => api.issues.get({ id: issueId }), [issueId]),
    staticContext?.data
  );

  if (!fail && issue && issueInfo.state !== RequestState.Running) {
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
  } else if (fail) {
    return <ErrorPage statusCode={issueInfo.statusCode || 500} />;
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
