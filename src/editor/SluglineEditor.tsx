import React, { useMemo, useState } from "react";

import { Node, createEditor, Element, Range } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
  useSlate
} from "slate-react";

import { Leaf } from "./components/Leaf";
import * as EditorHelpers from "./helpers";
import { Mark, SluglineElement, ElementType } from "./types";

import "./SluglineEditor.scss";
import Link from "./components/Link";
import EditorControls from "./EditorControls";

const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />;
};

const renderElement = (props: RenderElementProps) => {
  const element = props.element as SluglineElement;
  switch (element.type) {
    case ElementType.Link:
      return <Link {...props} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const isInline = (element: Element) => {
  const e = element as SluglineElement;
  switch (e.type) {
    case ElementType.Link:
      return true;
    default:
      return false;
  }
};

const createCustomEditor = () => {
  const editor = createEditor();
  editor.isInline = isInline;
  return editor;
};

const SluglineEditor = () => {
  const editor = useMemo(() => withReact(createCustomEditor()), []);
  const [value, setValue] = useState<Node[]>([
    {
      children: [
        {
          text: ""
        }
      ]
    }
  ]);
  const [selection, setSelection] = useState<Range | null>(editor.selection);

  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  return (
    <Slate value={value} onChange={setValue} editor={editor}>
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
      <EditorControls />
      <div className="editor-body">
        <Editable
          placeholder="Start your masterpiece..."
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={(evt: React.KeyboardEvent) => {
            EditorHelpers.keyDown(editor, evt);
          }}
          onBlur={() => {
            setSelection(editor.selection);
          }}
          onFocus={() => {
            editor.selection = selection;
          }}
        />
      </div>
    </Slate>
  );
};

export default SluglineEditor;
