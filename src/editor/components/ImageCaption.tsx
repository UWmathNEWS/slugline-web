import React from "react";

import { RenderElementProps } from "slate-react";

import "./styles/ImageCaption.scss";

const ImageCaption: React.FC<RenderElementProps> = (props) => {
  return (
    <p {...props.attributes} className="ImageCaption">
      <b>{props.children}</b>
    </p>
  );
};

export default ImageCaption;
