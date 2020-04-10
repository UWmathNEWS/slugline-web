import React, { useMemo, useState, useEffect } from "react";

import { Node, Range } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps
} from "slate-react";

import { Leaf } from "./components/Leaf";
import * as EditorHelpers from "./helpers";
import { SluglineElement, ElementType } from "./types";

import "./SluglineEditor.scss";
import Link from "./components/Link";
import EditorControls from "./EditorControls";
import InlineLatex from "./components/InlineLatex";
import createCustomEditor from "./CustomEditor";
import { useParams } from "react-router-dom";
import { useArticle, useArticleContent } from "../api/hooks";

const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />;
};

const renderElement = (props: RenderElementProps) => {
  const element = props.element as SluglineElement;
  switch (element.type) {
    case ElementType.Link:
      return <Link {...props} />;
    case ElementType.InlineLatex:
      return <InlineLatex {...props} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const EDITOR_STATE_EMPTY = [
  {
    children: [
      {
        text: ""
      }
    ]
  }
]

const SluglineEditor = () => {
  const { articleId } = useParams()
  const id = parseInt(articleId || '')

  const [articleResp, articleError] = useArticle(id)

  useEffect(() => {
    if (articleResp) {
      setTitle(articleResp.title)
      setSubtitle(articleResp.sub_title)
    }
  }, [articleResp])

  const [contentResp, contentError] = useArticleContent(id)

  useEffect(() => {
    if (contentResp && contentResp.content_raw !== '') {
      setValue(JSON.parse(contentResp.content_raw))
    }
  }, [contentResp])

  const editor = useMemo(() => withReact(createCustomEditor()), []);
  const [value, setValue] = useState<Node[]>(EDITOR_STATE_EMPTY);
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
