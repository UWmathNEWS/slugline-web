import React from "react";
import { ForwardAttributes } from "../types";

import "./styles/Dateline.scss";

const Dateline: React.FC<ForwardAttributes> = ({
  className,
  children,
  ...props
}) => (
  <span className={`Dateline ${className || ""}`} {...props}>
    {children}
  </span>
);

export default Dateline;
