import React, { useState } from "react";
import { Editor, EditorState } from "draft-js";

import "draft-js/dist/Draft.css";
import "./Editor.scss";

const ArticleEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  const onChange = (state: EditorState) => {
    setEditorState(state);
  };

  return (
    <div className="editor-body">
      <Editor editorState={editorState} onChange={onChange} />
    </div>
  );
};

export default ArticleEditor;
