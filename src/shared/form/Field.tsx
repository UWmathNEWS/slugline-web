import React from "react";
import { FormControl, FormControlProps, InputGroup } from "react-bootstrap";
import { NestDataObject, FieldError, ErrorMessage } from "react-hook-form";
import { BsPrefixProps, ReplaceProps } from "react-bootstrap/helpers";
import ERRORS from "../errors";

type FormControlElement = HTMLInputElement &
  HTMLSelectElement &
  HTMLTextAreaElement;

interface FieldPropsExtra<T> extends FormControlProps {
  name: string;
  errors: NestDataObject<T, FieldError>;
  hideErrorMessage?: boolean;
  validMessage?: string;
  prepend?: JSX.Element;
  append?: JSX.Element;
}

// This abomination combines our props with the Form.Control props
// so we can forward them through
export type FieldProps<
  As extends React.ElementType = "input"
> = FieldPropsExtra<any> &
  Omit<ReplaceProps<As, BsPrefixProps<As> & FormControlProps>, "ref">;

const Field = React.forwardRef<FormControl & FormControlElement, FieldProps>(
  (props, forwardedRef) => {
    const {
      name,
      errors,
      hideErrorMessage,
      validMessage,
      prepend,
      append,
      ...rest
    } = props;
    return (
      <>
        <InputGroup>
          {prepend && <InputGroup.Prepend>{prepend}</InputGroup.Prepend>}
          <FormControl
            name={name}
            isInvalid={errors[name]}
            isValid={!!validMessage && !errors[name]}
            ref={forwardedRef}
            {...rest}
          />
          {append && <InputGroup.Append>{append}</InputGroup.Append>}
          {!hideErrorMessage && (
            <ErrorMessage name={name} errors={errors}>
              {({ message, messages }) => {
                if (messages) {
                  return Object.values(messages).map((msg) =>
                    typeof msg === "string" ? (
                      <small key={msg} className="invalid-feedback d-block">
                        {ERRORS[msg]}
                      </small>
                    ) : (
                      msg
                    )
                  );
                }
                return typeof message === "string" ? (
                  <small className="invalid-feedback">{ERRORS[message]}</small>
                ) : (
                  message
                );
              }}
            </ErrorMessage>
          )}
          {validMessage && !errors[name] && (
            <small className="valid-feedback">{validMessage}</small>
          )}
        </InputGroup>
      </>
    );
  }
);

export default Field;
