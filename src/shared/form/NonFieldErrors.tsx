import React from "react";
import ERRORS from "../errors";

interface NonFieldErrorsProps {
  errors: string[];
}

const NonFieldErrors: React.FC<NonFieldErrorsProps> = (
  props: NonFieldErrorsProps
) => {
  return (
    <>
      {props.errors?.map(error => (
        <small key={error} className="invalid-feedback d-block">
          {ERRORS[error]}
        </small>
      ))}
    </>
  );
};

export default NonFieldErrors;
