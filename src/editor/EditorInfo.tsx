import React from "react";
import { RequestState } from "../shared/types";

interface EditorInfoProps {
  editorRequestState: RequestState;
  lastSaveTime: Date;
}

const EditorInfo: React.FC<EditorInfoProps> = (props: EditorInfoProps) => {
  return (
    <div className="editor-info">
      {props.editorRequestState === RequestState.Started && <h1>Saving...</h1>}
      {(props.editorRequestState === RequestState.Complete ||
        props.editorRequestState === RequestState.NotStarted) && <h1>Saved</h1>}
      <h1>{`Last Saved: ${props.lastSaveTime.toLocaleString()}`}</h1>
    </div>
  );
};

export default EditorInfo;
