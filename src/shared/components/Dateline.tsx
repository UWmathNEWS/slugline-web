import React from "react";

import "./styles/Dateline.scss";

const Dateline: React.FC = (props) => (
  <span className="Dateline">{props.children}</span>
);

export default Dateline;
