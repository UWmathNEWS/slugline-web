import React from "react";
import { EditorState } from "draft-js";

import "./EditorHeader.scss";
import {
  BoldControl,
  ItalicControl,
  UnderlineControl,
  StrikethroughControl,
  CodeControl
} from "./EditorControls";

interface EditorHeaderProps {
  state: EditorState;
  setState: (state: EditorState) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = (
  props: EditorHeaderProps
) => {
  const basicControls = [
    BoldControl,
    ItalicControl,
    UnderlineControl,
    StrikethroughControl,
    CodeControl
  ];
  return (
    <div className="editor-controls">
      {basicControls.map(Control => (
        <Control state={props.state} setState={props.setState} />
      ))}
      <div className="editor-separator" />
    </div>
  );
};

export default EditorHeader;
