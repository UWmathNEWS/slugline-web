import React from "react";
import { RenderElementProps, useSelected, useSlate } from "slate-react";
import { isSelectionCollapsed } from "../helpers";

import "./styles/VoidSpacer.scss";

const VoidSpacer: React.FC<RenderElementProps> = (props) => {
  const editor = useSlate();
  const selected = useSelected();

  return (
    <span
      {...props.attributes}
      className={`VoidSpacer ${
        selected && isSelectionCollapsed(editor) ? "VoidSpacer--selected" : ""
      }`}
    >
      {props.children}
    </span>
  );
};

export default VoidSpacer;
