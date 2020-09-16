import React from "react";

import "./styles/Dateline.scss";

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
