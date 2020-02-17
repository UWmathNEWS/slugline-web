import React, { useState } from "react";
import { Editor, EditorState } from "draft-js";

import "draft-js/dist/Draft.css";
import "./Editor.scss";

const ArticleEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  const onEditorChange = (state: EditorState) => {
    setEditorState(state);
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
      <div className="editor-body">
        <Editor editorState={editorState} onChange={onEditorChange} />
      </div>
    </>
  );
};

export default ArticleEditor;
