import React from "react";
import { Form, FormControl, FormControlProps } from "react-bootstrap";
import { NestDataObject, FieldError, ErrorMessage } from "react-hook-form";
import { BsPrefixProps, ReplaceProps } from "react-bootstrap/helpers";

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface FieldPropsExtra<T> {
  errors: NestDataObject<T, FieldError>;
  hideErrorMessage?: boolean;
}

// This abomination combines our props with the Form.Control props
// so we can forward them through
type FieldProps<As extends React.ElementType = "input"> = FieldPropsExtra<any> &
  Omit<ReplaceProps<As, BsPrefixProps<As> & FormControlProps>, "ref">;

const Field = React.forwardRef<FormControlElement, FieldProps>(
  (props: FieldProps, forwardedRef) => {
    const { innerRef, errors, hideErrorMessage, ...rest } = props;
    return (
      <>
        <Form.Control
          name={rest.name}
          id={rest.id}
          isInvalid={errors[rest.name || ""]}
          ref={forwardedRef as React.Ref<FormControl<React.ElementType<any>>>}
          {...rest}
        />
        {!hideErrorMessage && (
          <ErrorMessage name={rest.name || ""} errors={errors}>
            {({ message }) => (
              <small className="invalid-feedback">{message}</small>
            )}
          </ErrorMessage>
        )}
      </>
    );
  }
);

export default Field;
