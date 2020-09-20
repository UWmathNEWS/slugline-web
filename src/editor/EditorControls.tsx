import React from "react";
import {
  ToggleMarkButton,
  LinkButton,
  InlineLatexButton,
  ToggleBlockButton,
  ExtrasDropdown,
  EditorDropdown,
  ToggleMarkButtonText,
  ToggleBlockButtonText,
  ImageButton,
} from "./components/controls";
import { Mark, BlockElementType } from "./types";

import "./styles/EditorControls.scss";

const EditorControls: React.FC = () => {
  return (
    <div className="editor-controls">
      <EditorDropdown
        rootButton={
          <ToggleMarkButton icon="bold" title="Stress 1" mark={Mark.Stress1} />
        }
        subMarks={[Mark.Stress2]}
        id="stress-dropdown"
      >
        <ToggleMarkButtonText text="Stress 2" mark={Mark.Stress2} />
      </EditorDropdown>
      <EditorDropdown
        rootButton={
          <ToggleMarkButton
            icon="italic"
            title="Emphasis 1"
            mark={Mark.Emph1}
          />
        }
        subMarks={[Mark.Emph2, Mark.Emph3, Mark.Emph4]}
        id="emph-dropdown"
      >
        <ToggleMarkButtonText text="Emphasis 2" mark={Mark.Emph2} />
        <ToggleMarkButtonText text="Emphasis 3" mark={Mark.Emph3} />
        <ToggleMarkButtonText text="Emphasis 4" mark={Mark.Emph4} />
      </EditorDropdown>
      <ToggleMarkButton
        icon="strikethrough"
        title="Strikethrough"
        mark={Mark.Strikethrough}
      />
      <div className="editor-separator" />
      <LinkButton />
      <InlineLatexButton />
      <div className="editor-separator" />
      <EditorDropdown
        rootButton={
          <ToggleBlockButton
            icon="heading"
            title="Heading"
            blockType={BlockElementType.Header1}
          />
        }
        subBlocks={[BlockElementType.Header2]}
        id="header-dropdown"
      >
        <ToggleBlockButtonText
          text="Header 2"
          block={BlockElementType.Header2}
        />
      </EditorDropdown>
      <ToggleBlockButton
        icon="code"
        title="Code Block"
        blockType={BlockElementType.Code}
      />
      <ToggleBlockButton
        icon="list-ul"
        title="Unordered List"
        blockType={BlockElementType.UnorderedList}
      />
      <ToggleBlockButton
        icon="list-ol"
        title="Ordered List"
        blockType={BlockElementType.OrderedList}
      />
      <ImageButton />
      <ExtrasDropdown />
    </div>
  );
};

export default EditorControls;
