import React from "react";
import {
  ToggleMarkButton,
  LinkButton,
  InlineLatexButton,
  IncreaseStressButton,
  IncreaseEmphButton,
  HeaderButton,
} from "./components/controls";
import { Mark } from "./types";

import "./styles/EditorControls.scss";

const EditorControls: React.FC = () => {
  return (
    <div className="editor-controls">
      <IncreaseStressButton />
      <IncreaseEmphButton />
      <ToggleMarkButton icon="strikethrough" mark={Mark.Strikethrough} />
      <ToggleMarkButton icon="code" mark={Mark.Code} />
      <div className="editor-separator" />
      <LinkButton />
      <InlineLatexButton />
      <div className="editor-separator" />
      <HeaderButton />
    </div>
  );
};

export default EditorControls;
