import React from "react";
import { RenderLeafProps, useSlate } from "slate-react";
import { Mark } from "../types";
import nanoid from "nanoid";

export const Leaf = (props: RenderLeafProps) => {
  let children = props.children;
  if (props.leaf[Mark.Emph1]) {
    children = <i>{children}</i>;
  }
  if (props.leaf[Mark.Emph2]) {
    children = (
      <b>
        <i>{children}</i>
      </b>
    );
  }
  if (props.leaf[Mark.Emph3]) {
    children = (
      <u>
        <b>
          <i>{children}</i>
        </b>
      </u>
    );
  }
  if (props.leaf[Mark.Emph4]) {
    children = (
      <u className="double-underline">
        <b>
          <i>{children}</i>
        </b>
      </u>
    );
  }
  if (props.leaf[Mark.Stress1]) {
    children = <b>{children}</b>;
  }
  if (props.leaf[Mark.Stress2]) {
    children = (
      <u>
        <b>{children}</b>
      </u>
    );
  }
  if (props.leaf[Mark.Strikethrough]) {
    children = <del>{children}</del>;
  }
  if (props.leaf[Mark.Code]) {
    children = <pre>{children}</pre>;
  }
  return <span {...props.attributes}>{children}</span>;
};
