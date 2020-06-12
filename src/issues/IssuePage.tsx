import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Issue, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import { RequestState, useAPILazy } from "../api/hooks";
import api from "../api/api";
import ErrorPage from "../shared/errors/ErrorPage";

const IssuePage: React.FC<RouteComponentProps<any, Issue>> = ({
  route,
  location,
  staticContext,
}) => {
  const { issue_id: issueId } = useParams();
  const [getIssue, getIssueInfo] = useAPILazy(api.issues.get);
  const [issue, setIssue] = useState(staticContext?.data);
  const [statusCode, setStatusCode] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      if (window.__SSR_DIRECTIVES__.STATUS_CODE) {
        setStatusCode(window.__SSR_DIRECTIVES__.STATUS_CODE);
        delete window.__SSR_DIRECTIVES__.STATUS_CODE;
        return;
      }
      if (window.__SSR_DIRECTIVES__.DATA) {
        setIssue(window.__SSR_DIRECTIVES__.DATA);
        delete window.__SSR_DIRECTIVES__.DATA;
      } else {
        getIssue({ id: issueId || "" }).then((resp) => {
          if (resp.success) {
            setIssue(resp.data);
          } else {
            setStatusCode(resp.statusCode);
          }
        });
      }
    }, 0);
  }, [getIssue, issueId]);

  if (!statusCode && issue && getIssueInfo.state !== RequestState.Running) {
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
  } else if (statusCode) {
    return <ErrorPage statusCode={statusCode} />;
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
