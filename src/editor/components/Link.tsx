import React from "react";
import { RenderElementProps } from "slate-react";
import { LinkElement } from "../types";

const Link: React.FC<RenderElementProps> = (props: RenderElementProps) => {
  const element = props.element as LinkElement;
  return (
    <a {...props.attributes} href={element.href}>
      {props.children}
    </a>
  );
};

export default Link;
