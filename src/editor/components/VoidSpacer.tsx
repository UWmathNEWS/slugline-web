import React from "react";
import { RenderElementProps, useSelected } from "slate-react";

import "./styles/VoidSpacer.scss";

const VoidSpacer: React.FC<RenderElementProps> = (props) => {
  const selected = useSelected();
  return (
    <span
      {...props.attributes}
      className={`VoidSpacer ${selected && "VoidSpacer--selected"}`}
    >
      {props.children}
    </span>
  );
};

export default VoidSpacer;
