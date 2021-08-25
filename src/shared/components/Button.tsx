/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import { Button as BsButton } from "react-bootstrap";
import type { ButtonProps as BsButtonProps } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import "./styles/Button.scss";

export interface ButtonProps {
  variant:
    | "dark"
    | "light"
    | "pink-dark"
    | "pink-light"
    | "grey-dark"
    | "grey-light";
}

/**
 * A button is used to allow the user to perform an action.
 *
 * @param variant The theme of the button
 * @param className Additional classes to attach to the button
 * @param children The contents of the button
 * @param props Additional props to forward to the button
 */
const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & Omit<BsButtonProps, "variant"> & JSX.IntrinsicElements["button"]
>(({ variant, className, children, ...props }, ref) => {
  return (
    <BsButton
      ref={ref}
      variant="primary"
      {...(props as BsButtonProps)}
      className={`Button Button--${variant} ${className || ""}`}
    >
      {children}
    </BsButton>
  );
});

/**
 * A LinkButton is used for links that *really* need to stand out. Use very, very sparingly.
 */
export const LinkButton = React.forwardRef<
  HTMLAnchorElement,
  ButtonProps & LinkProps
>(({ variant, className, children, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      {...(props as LinkProps)}
      className={`btn btn-primary Button Button--${variant} ${className || ""}`}
    >
      {children}
    </Link>
  );
});

export default Button;
