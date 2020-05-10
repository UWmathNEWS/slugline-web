import React from "react";
import { Form, FormControl, FormControlProps } from "react-bootstrap";
import { NestDataObject, FieldError, ErrorMessage } from "react-hook-form";
import { BsPrefixProps, ReplaceProps } from "react-bootstrap/helpers";
import ERRORS from "../errors";

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface FieldPropsExtra<T> {
  errors: NestDataObject<T, FieldError>;
  hideErrorMessage?: boolean;
  validMessage?: string;
}

// This abomination combines our props with the Form.Control props
// so we can forward them through
type FieldProps<As extends React.ElementType = "input"> = FieldPropsExtra<any> &
  Omit<ReplaceProps<As, BsPrefixProps<As> & FormControlProps>, "ref">;

const Field = React.forwardRef<FormControlElement, FieldProps>(
  (props: FieldProps, forwardedRef) => {
    const { innerRef, errors, hideErrorMessage, validMessage, ...rest } = props;
    return (
      <>
        <Form.Control
          name={rest.name}
          id={rest.id}
          isInvalid={errors[rest.name || ""]}
          isValid={!!validMessage && !errors[rest.name || ""]}
          ref={forwardedRef as React.Ref<FormControl<React.ElementType<any>>>}
          {...rest}
        />
        {!hideErrorMessage && (
          <ErrorMessage name={rest.name || ""} errors={errors}>
            {({ message }) =>
              typeof message === "string" ? (
                <small className="invalid-feedback">
                  {ERRORS[message] || message}
                </small>
              ) : (
                message
              )
            }
          </ErrorMessage>
        )}
        {validMessage && !errors[rest.name || ""] && (
          <small className="valid-feedback">{validMessage}</small>
        )}
      </>
    );
  }
);

export default Field;
