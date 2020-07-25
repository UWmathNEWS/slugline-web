import React from "react";
import {
  ToggleMarkButton,
  LinkButton,
  InlineLatexButton,
  ToggleBlockButton,
  ExtrasDropdown,
  EditorDropdown,
  ToggleMarkButtonText,
} from "./components/controls";
import { Mark, BlockElementType } from "./types";

import "./styles/EditorControls.scss";

const EditorControls: React.FC = () => {
  return (
    <div className="editor-controls">
      <EditorDropdown
        rootButton={<ToggleMarkButton icon="bold" mark={Mark.Stress1} />}
        id="stress-dropdown"
      >
        <ToggleMarkButtonText text="Stress 2" mark={Mark.Stress2} />
      </EditorDropdown>
      <EditorDropdown
        rootButton={<ToggleMarkButton icon="italic" mark={Mark.Emph1} />}
        id="emph-dropdown"
      >
        <ToggleMarkButtonText text="Emphasis 2" mark={Mark.Emph2} />
        <ToggleMarkButtonText text="Emphasis 3" mark={Mark.Emph3} />
        <ToggleMarkButtonText text="Emphasis 4" mark={Mark.Emph4} />
      </EditorDropdown>
      <ToggleMarkButton icon="strikethrough" mark={Mark.Strikethrough} />
      <ToggleMarkButton icon="code" mark={Mark.Code} />
      <div className="editor-separator" />
      <LinkButton />
      <InlineLatexButton />
      <div className="editor-separator" />
      <ToggleBlockButton icon="heading" blockType={BlockElementType.Header} />
      <ExtrasDropdown />
    </div>
  );
};

export default EditorControls;
