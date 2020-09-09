import React from "react";

import "./styles/Dateline.scss";

const Dateline: React.FC = (props) => (
  <span className="dateline">{props.children}</span>
);

export default Dateline;
