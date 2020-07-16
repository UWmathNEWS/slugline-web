import React, { useMemo, useState, useEffect } from "react";

import { Node, Range } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
} from "slate-react";

import { Leaf } from "./components/Leaf";
import * as EditorHelpers from "./helpers";
import { SluglineElement, ElementType } from "./types";

import "./styles/SluglineEditor.scss";
import Link from "./components/Link";
import EditorControls from "./EditorControls";
import InlineLatex from "./components/InlineLatex";
import createCustomEditor from "./CustomEditor";
import { useDebouncedCallback } from "../shared/hooks";

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
    case ElementType.Header:
      return <h6 {...props.attributes}>{props.children}</h6>;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const EDITOR_STATE_EMPTY: Node[] = [
  {
    children: [
      {
        text: "",
      },
    ],
  },
];

interface SluglineEditorProps {
  title?: string;
  subtitle?: string;
  author?: string;
  content_raw?: Node[];
  saveArticle: (title: string, subtitle: string, author: string) => void;
  saveArticleContent: (content: Node[]) => void;
}

const SPELLCHECK_ENABLE_WAIT_MS = 500;

const SluglineEditor: React.FC<SluglineEditorProps> = (
  props: SluglineEditorProps
) => {
  const editor = useMemo(() => withReact(createCustomEditor()), []);

  const [value, setValue] = useState<Node[]>(
    props.content_raw || EDITOR_STATE_EMPTY
  );
  const [selection, setSelection] = useState<Range | null>(editor.selection);
  const [spellcheck, setSpellcheck] = useState<boolean>(false);

  const [enableSpellcheckDebounced] = useDebouncedCallback(() => {
    setSpellcheck(true);
  }, SPELLCHECK_ENABLE_WAIT_MS);

  const [title, setTitle] = useState<string>(props.title || "");
  const [subtitle, setSubtitle] = useState<string>(props.subtitle || "");
  const [author, setAuthor] = useState<string>(props.author || "");

  const { saveArticle, saveArticleContent } = props;

  useEffect(() => {
    saveArticle(title, subtitle, author);
  }, [saveArticle, title, subtitle, author]);

  useEffect(() => {
    saveArticleContent(value);
  }, [saveArticleContent, value]);

  return (
    <Slate
      value={value}
      onChange={(value) => {
        setValue(value);
        setSpellcheck(false);
        // re enable it if there's been no change for SPELLCHECK_ENABLE_WAIT_MS
        // milliseconds
        enableSpellcheckDebounced();
      }}
      editor={editor}
    >
      <div className="editor">
        <div className="editor-header">
          <input
            className="editor-header-input title-input"
            type="text"
            placeholder="YOUR TITLE"
            value={title}
            onChange={(evt) => {
              setTitle(evt.currentTarget.value);
            }}
          ></input>
          <input
            className="editor-header-input subtitle-input"
            type="text"
            placeholder="YOUR SUBTITLE"
            value={subtitle}
            onChange={(evt) => {
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
            spellCheck={spellcheck}
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
        <div className="editor-footer">
          <input
            className="editor-header-input author-input"
            type="text"
            placeholder="YOUR AUTHOR NAME"
            value={author}
            onChange={(evt) => {
              setAuthor(evt.currentTarget.value);
            }}
          ></input>
        </div>
      </div>
    </Slate>
  );
};

export default SluglineEditor;
