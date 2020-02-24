import React, { useMemo, useState } from "react";

import { Node, createEditor } from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";

import { Leaf } from "./components/Leaf";
import * as EditorHelpers from "./helpers";
import { Mark } from "./types";

import "./SluglineEditor.scss";

const SluglineEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Node[]>([
    {
      children: [
        {
          text: ""
        }
      ]
    }
  ]);

  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  const renderLeaf = (props: RenderLeafProps) => {
    return <Leaf {...props} />;
  };

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
      <div className="editor-body">
        <Editable
          placeholder="Start your masterpiece..."
          renderLeaf={renderLeaf}
          onKeyDown={(evt: React.KeyboardEvent) => {
            EditorHelpers.keyDown(editor, evt);
          }}
        />
      </div>
    </Slate>
  );
};

export default SluglineEditor;
