import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAPI } from "../api/hooks";
import api from "../api/api";

const IssuePage = () => {
  const { issue_id } = useParams();
  const [issue, ,] = useAPI(
    useCallback(() => {
      return api.issues.get({ id: issue_id || "" });
    }, [issue_id])
  );

  if (issue) {
    return <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_code}`}</h1>;
  } else {
    return <h1>LOADING...</h1>;
  }
};

export default IssuePage;
