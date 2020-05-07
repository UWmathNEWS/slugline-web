import React from "react";
import { APIError } from "../types";
import Error404 from "./Error404";
import Error500 from "./Error500";

interface ErrorPageProps<U extends APIError = APIError> {
  error: U;
}

export const ErrorPage: React.FC<ErrorPageProps> = (props: ErrorPageProps) => {
  if (props.error.status_code === 404) {
    return <Error404 />;
  } else {
    return <Error500 />;
  }
};
