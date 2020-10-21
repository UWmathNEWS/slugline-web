import React from "react";
import { Range } from "slate";
import { RenderElementProps, useSelected, useSlate } from "slate-react";

import "./styles/VoidSpacer.scss";

const VoidSpacer: React.FC<RenderElementProps> = (props) => {
  const editor = useSlate();
  const selected = useSelected();

  return (
    <span
      {...props.attributes}
      className={`VoidSpacer ${
        selected && editor.selection && Range.isCollapsed(editor.selection)
          ? "VoidSpacer--selected"
          : ""
      }`}
    >
      {props.children}
    </span>
  );
};

export default VoidSpacer;
