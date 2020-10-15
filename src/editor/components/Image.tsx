import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import { Transforms } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useSelected,
} from "slate-react";
import { ImageElement } from "../types";
import ImagePopover from "./ImagePopover";
import PopoverWrapper from "./PopoverWrapper";

import "./styles/Image.scss";

const Image: React.FC<RenderElementProps> = (props) => {
  const [show, setShow] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const errorDivRef = useRef<HTMLDivElement>(null);
  const editor = useEditor();
  const selected = useSelected();

  const element = props.element as ImageElement;

  const submit = (src: string) => {
    ReactEditor.focus(editor);
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { src: src }, { at: path });
    setShow(false);
    setHasError(false);
  };

  return (
    <div className="Image" {...props.attributes}>
      <div
        contentEditable={false}
        onClick={() => {
          setShow(true);
        }}
      >
        {hasError ? (
          <div
            className={`Image_error ${selected ? "Image_error--selected" : ""}`}
            ref={errorDivRef}
          >
            <div>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p className="mb-0">That image could not be found.</p>
            </div>
          </div>
        ) : (
          <img
            ref={imgRef}
            onError={() => {
              setHasError(true);
            }}
            onLoad={() => {
              setHasError(false);
            }}
            className={`Image_img ${selected ? "Image_img--selected" : ""}`}
            src={element.src}
            alt="mathNEWS content"
          />
        )}
      </div>
      {props.children}
      <PopoverWrapper
        show={show}
        setShow={setShow}
        target={() => imgRef.current || errorDivRef.current}
      >
        <ImagePopover src={element.src} submit={submit} />
      </PopoverWrapper>
    </div>
  );
};

export default Image;
