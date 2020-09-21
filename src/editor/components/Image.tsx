import React from "react";
import { RenderElementProps } from "slate-react";
import { ImageElement } from "../types";

const Image: React.FC<RenderElementProps> = (props) => {
  const element = props.element as ImageElement;
  return (
    <div {...props.attributes}>
      <div contentEditable={false}>
        <img src={element.src} alt="mathNEWS content" />
      </div>
      {props.children}
    </div>
  );
};

export default Image;
