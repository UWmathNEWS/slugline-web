import React from "react";
import Error404 from "./Error404";
import Error500 from "./Error500";

export interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage: React.FC<ErrorPageProps> = (props) => {
  if (props.statusCode === 404) {
    return <Error404 />;
  } else {
    return <Error500 />;
  }
};

export default ErrorPage;
