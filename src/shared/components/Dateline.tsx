import React from "react";

import "./styles/Dateline.scss";

/**
 * Use to display the date of an article, issue, or object.
 *
 * @param className Additional classes to attach
 * @param children The contents of the component
 * @param props Additional props to forward
 */
const Dateline: React.FC<JSX.IntrinsicElements["div"]> = ({
  className,
  children,
  ...props
}) => (
  <div className={`Dateline ${className || ""}`} {...props}>
    {children}
  </div>
);

export default Dateline;
