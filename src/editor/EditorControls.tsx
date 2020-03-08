import React from "react";
import { ToggleMarkButton, LinkButton } from "./components/controls";
import { Mark } from "./types";

import "./EditorControls.scss";

const EditorControls: React.FC = () => {
  return (
    <div className="editor-controls">
      <ToggleMarkButton icon="bold" mark={Mark.Bold} />
      <ToggleMarkButton icon="italic" mark={Mark.Italic} />
      <ToggleMarkButton icon="underline" mark={Mark.Underline} />
      <ToggleMarkButton icon="strikethrough" mark={Mark.Strikethrough} />
      <ToggleMarkButton icon="code" mark={Mark.Code} />
      <div className="editor-separator" />
      <LinkButton />
    </div>
  );
};

export default EditorControls;
