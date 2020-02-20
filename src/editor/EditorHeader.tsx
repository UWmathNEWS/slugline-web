import React from "react";
import { EditorState } from "draft-js";

import "./EditorHeader.scss";
import { BoldControl, ItalicControl, UnderlineControl } from "./EditorControls";

interface EditorHeaderProps {
  state: EditorState;
  setState: (state: EditorState) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = (
  props: EditorHeaderProps
) => {
  const controls = [BoldControl, ItalicControl, UnderlineControl];
  return (
    <div className="editor-controls">
      {controls.map(Control => (
        <Control state={props.state} setState={props.setState} />
      ))}
    </div>
  );
};

export default EditorHeader;
