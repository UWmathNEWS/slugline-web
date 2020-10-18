import React from "react";
import { RenderElementProps, useSelected } from "slate-react";

const VoidSpacer: React.FC<RenderElementProps> = (props) => {
  const selected = useSelected();
  return (
    <span
      {...props.attributes}
      style={{
        display: "block",
        background: selected ? "red" : "none",
        width: "100%",
        height: "2px",
      }}
    >
      {props.children}
    </span>
  );
};

export default VoidSpacer;
