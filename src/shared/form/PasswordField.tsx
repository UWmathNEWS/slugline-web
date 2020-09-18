import React, { useState } from "react";
import Field, { FormControlElement, FieldProps } from "./Field";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FormContextValues } from "react-hook-form";

type PasswordFieldProps<T> = Omit<FieldProps, "errors"> & {
  context: FormContextValues<T>;
  state?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
};

export const validatePassword = {
  minLength(password: string): string | undefined {
    if (password.length && password.length < 8) {
      return "USER.PASSWORD.TOO_SHORT.8";
    }
  },
  numeric(password: string): string | undefined {
    // the pattern argument doesn't let us return an error if the value FAILS a regex,
    // so we'll do it ourselves
    if (/^\d+$/.test(password)) {
      return "USER.PASSWORD.ENTIRELY_NUMERIC";
    }
  },
};

const PasswordField = React.forwardRef<
  FormControlElement,
  PasswordFieldProps<any>
>(({ state = useState<boolean>(false), context, ...props }, ref) => {
  const [showPassword, setShowPassword] = state;
  return (
    <Field
      type={showPassword ? "text" : "password"}
      append={
        <Button
          title={showPassword ? "Mask password" : "Show password"}
          variant={showPassword ? "outline-primary" : "outline-secondary"}
          onClick={() => {
            setShowPassword((show) => !show);
          }}
        >
          {showPassword ? (
            <FontAwesomeIcon icon={faEyeSlash} />
          ) : (
            <FontAwesomeIcon icon={faEye} />
          )}
        </Button>
      }
      errors={context.errors}
      ref={
        ref ||
        context.register({
          required: "USER.PASSWORD.NEW_REQUIRED",
          validate: validatePassword,
        })
      }
      {...props}
    />
  );
});

export default PasswordField;
