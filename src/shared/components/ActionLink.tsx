import React from "react";

import "./styles/ActionLink.scss";
import { Link, LinkProps } from "react-router-dom";

const ActionLink = React.forwardRef<Link, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link ref={ref} className={`ActionLink ${className || ""}`} {...props}>
        {children}
      </Link>
    );
  }
);

export default ActionLink;
