import React from "react";
import { RenderLeafProps } from "slate-react";
import { Mark } from "../types";

export const Leaf = (props: RenderLeafProps) => {
  let children = props.children;
  if (props.leaf[Mark.Emph1]) {
    children = <em>{children}</em>;
  }
  if (props.leaf[Mark.Emph2]) {
    children = (
      <strong>
        <em>{children}</em>
      </strong>
    );
  }
  if (props.leaf[Mark.Emph3]) {
    children = (
      <span className="underline-custom">
        <strong>
          <em>{children}</em>
        </strong>
      </span>
    );
  }
  if (props.leaf[Mark.Emph4]) {
    children = (
      <span className="double-underline-custom">
        <strong>
          <em>{children}</em>
        </strong>
      </span>
    );
  }
  if (props.leaf[Mark.Stress1]) {
    children = <strong>{children}</strong>;
  }
  if (props.leaf[Mark.Stress2]) {
    children = (
      <span className="underline-custom">
        <strong>{children}</strong>
      </span>
    );
  }
  if (props.leaf[Mark.Strikethrough]) {
    children = <del>{children}</del>;
  }
  if (props.leaf[Mark.ArticleRef]) {
    children = (
      <em>
        <span className="dotted-underline-custom">{children}</span>
      </em>
    );
  }
  return <span {...props.attributes}>{children}</span>;
};
