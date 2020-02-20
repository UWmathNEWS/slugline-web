import React, { useState } from "react";
import { Editor, EditorState, RichUtils, DraftHandleValue } from "draft-js";

import "draft-js/dist/Draft.css";
import "./Editor.scss";
import EditorHeader from "./EditorHeader";

const ArticleEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  const onEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleKeyCommand = (
    command: string,
    state: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      onEditorChange(newState);
      return "handled";
    } else {
      return "not-handled";
    }
  };

  return (
    <>
      <div className="editor-header">
        <input
          className="editor-header-input title-input"
          type="text"
          placeholder="YOUR TITLE"
          value={title}
          onChange={evt => {
            setTitle(evt.currentTarget.value);
          }}
        ></input>
        <input
          className="editor-header-input subtitle-input"
          type="text"
          placeholder="YOUR SUBTITLE"
          value={subtitle}
          onChange={evt => {
            setSubtitle(evt.currentTarget.value);
          }}
        ></input>
      </div>
      <EditorHeader state={editorState} setState={setEditorState} />
      <div className="editor-body">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onEditorChange}
        />
      </div>
    </>
  );
};

export default ArticleEditor;
