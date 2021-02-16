import React from "react";

import "./styles/ActionLink.scss";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

/**
 * A call to action link.
 *
 * @param className Additional classes to attach
 * @param children The contents of the link
 * @param to Where the link should point to
 * @param props Additional props to forward to the link
 */
const ActionLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={`ActionLink ${className || ""}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

export default ActionLink;
