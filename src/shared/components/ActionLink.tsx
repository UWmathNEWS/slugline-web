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
      // Link forwards its refs (see
      // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md#innerref-refobject)
      // but this is not recognized by the provided typings, so we must bodge it with a cast
      <Link
        ref={ref as React.Ref<Link>}
        className={`ActionLink ${className || ""}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

export default ActionLink;
