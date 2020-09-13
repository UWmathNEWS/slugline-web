import React from "react";
import {
  Button as BsButton,
  ButtonProps as BsButtonProps,
} from "react-bootstrap";

import "./styles/Button.scss";
import { Link, LinkProps } from "react-router-dom";

export interface ButtonProps {
  variant:
    | "dark"
    | "light"
    | "pink-dark"
    | "pink-light"
    | "grey-dark"
    | "grey-light";
}

const Button = React.forwardRef<
  BsButton & HTMLButtonElement,
  ButtonProps & Omit<BsButtonProps, "variant"> & JSX.IntrinsicElements["button"]
>(({ variant, className, children, ...props }, ref) => {
  return (
    <BsButton
      ref={ref}
      variant="primary"
      {...(props as BsButtonProps)}
      className={`Button Button-${variant} ${className || ""}`}
    >
      {children}
    </BsButton>
  );
});

export const LinkButton = React.forwardRef<Link, ButtonProps & LinkProps>(
  ({ variant, className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        {...(props as LinkProps)}
        className={`btn btn-primary Button Button-${variant} ${
          className || ""
        }`}
      >
        {children}
      </Link>
    );
  }
);

export default Button;
