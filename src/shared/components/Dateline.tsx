import React from "react";

import "./styles/Dateline.scss";

/**
 * Use to display the date of an article, issue, or object.
 *
 * @param className Additional classes to attach
 * @param children The contents of the component
 * @param props Additional props to forward
 */
const Dateline: React.FC<JSX.IntrinsicElements["span"]> = ({
  className,
  children,
  ...props
}) => (
  <span className={`Dateline ${className || ""}`} {...props}>
    {children}
  </span>
);

export default Dateline;
