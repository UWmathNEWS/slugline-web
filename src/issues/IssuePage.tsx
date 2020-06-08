import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Issue, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import { RequestState, useAPILazy } from "../api/hooks";
import api from "../api/api";

const IssuePage: React.FC<RouteComponentProps<any, Issue>> = ({
  route,
  location,
  staticContext,
}) => {
  const { issue_id } = useParams();
  const [getIssue, getIssueInfo] = useAPILazy(
    useCallback(() => {
      return api.issues.get({ id: issue_id || "" });
    }, [issue_id])
  );
  const [issue, setIssue] = useState(staticContext?.data);

  useEffect(() => {
    setTimeout(() => {
      if (window.__SSR_DIRECTIVES__.DATA) {
        setIssue(window.__SSR_DIRECTIVES__.DATA);
        delete window.__SSR_DIRECTIVES__.DATA;
      } else {
        getIssue().then((resp) => {
          if (resp.success) {
            setIssue(resp.data);
          }
        });
      }
    }, 0);
  }, []);

  if (issue && getIssueInfo.state !== RequestState.Running) {
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
