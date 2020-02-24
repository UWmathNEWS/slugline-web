import React from "react";
import { RenderLeafProps } from "slate-react";
import { Mark } from "../types";

export const Leaf = (props: RenderLeafProps) => {
  let children = props.children;
  if (props.leaf[Mark.Bold]) {
    children = <b>{children}</b>;
  }
  if (props.leaf[Mark.Italic]) {
    children = <i>{children}</i>;
  }
  if (props.leaf[Mark.Underline]) {
    children = <u>{children}</u>;
  }
  if (props.leaf[Mark.Strikethrough]) {
    children = <del>{children}</del>;
  }
  if (props.leaf[Mark.Code]) {
    children = <pre>{children}</pre>;
  }
  return <span {...props.attributes}>{children}</span>;
};
