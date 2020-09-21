import React from "react";
import { RenderElementProps, useFocused, useSelected } from "slate-react";
import { ImageElement } from "../types";

import "./styles/Image.scss";

const Image: React.FC<RenderElementProps> = (props) => {
  const element = props.element as ImageElement;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div className="Image" {...props.attributes}>
      <div contentEditable={false}>
        <img
          className={`Image__img ${
            selected && focused ? "Image__img--selected" : ""
          }`}
          src={element.src}
          alt="mathNEWS content"
        />
      </div>
      {props.children}
    </div>
  );
};

export default Image;
