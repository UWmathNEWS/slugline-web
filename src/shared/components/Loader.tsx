import React from "react";
import { Spinner } from "react-bootstrap";
import "./Loader.scss";

interface LoaderProps  {
  variant: "spinner" | "linear";
  className?: string;
  hideFromScreenreaders?: boolean;
}

export default (props: LoaderProps) => {
  if (props.variant === "spinner") {
    return (
      <div className={`d-flex justify-content-center ${props.className}`}>
        <Spinner animation="border" role="status">
          {!props.hideFromScreenreaders && <span className="sr-only">Loading...</span>}
        </Spinner>
      </div>
    );
  } else if (props.variant === "linear") {
    return (
      <div className={props.className}>
        <div className="spinner-linear" role="status">
          {!props.hideFromScreenreaders && <span className="sr-only">Loading...</span>}
        </div>
      </div>
    )
  }
  return <></>;
}

