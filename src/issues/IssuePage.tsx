import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import { useAPI } from "../api/hooks";
import api from "../api/api";

const IssuePage: React.FC<RouteComponentProps> = ({ route, location }) => {
  const { issue_id } = useParams();
  const [issue] = useAPI(
    useCallback(() => {
      return api.issues.get({ id: issue_id || "" });
    }, [issue_id])
  );

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
