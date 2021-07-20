import React, { useMemo, useState, useEffect } from "react";

import { Descendant, Node, Range } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
} from "slate-react";
import { withHistory } from "slate-history";

import { Leaf } from "./components/Leaf";
import * as EditorHelpers from "./helpers";
import { SluglineElement, InlineElementType, BlockElementType } from "./types";

import "./styles/SluglineEditor.scss";
import Link from "./components/Link";
import EditorControls from "./EditorControls";
import InlineLatex from "./components/InlineLatex";
import createCustomEditor from "./CustomEditor";
import Image from "./components/Image";
import ImageCaption from "./components/ImageCaption";
import VoidSpacer from "./components/VoidSpacer";

const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />;
};

const renderElement = (props: RenderElementProps) => {
  const element = props.element as SluglineElement;
  switch (element.type) {
    case InlineElementType.Link:
      return <Link {...props} />;
    case InlineElementType.InlineLatex:
      return <InlineLatex {...props} />;
    case BlockElementType.Header1:
      return (
        <h5 {...props.attributes}>
          <strong>{props.children}</strong>
        </h5>
      );
    case BlockElementType.Header2:
      return <h6 {...props.attributes}>{props.children}</h6>;
    case BlockElementType.Code:
      return (
        <pre className="article-code-block" {...props.attributes}>
          {props.children}
        </pre>
      );
    case BlockElementType.OrderedList:
      return <ol {...props.attributes}>{props.children}</ol>;
    case BlockElementType.UnorderedList:
      return <ul {...props.attributes}>{props.children}</ul>;
    case BlockElementType.ListItem:
      return <li {...props.attributes}>{props.children}</li>;
    case BlockElementType.VoidSpacer:
      return <VoidSpacer {...props} />;
    case BlockElementType.Image:
      return <Image {...props} />;
    case BlockElementType.ImageCaption:
      return <ImageCaption {...props} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const EDITOR_STATE_EMPTY: Descendant[] = [
  {
    type: BlockElementType.Default,
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
  content_raw?: Descendant[];
  saveArticle: (title: string, subtitle: string, author: string) => void;
  saveArticleContent: (content: Node[]) => void;
}

const SluglineEditor: React.FC<SluglineEditorProps> = (
  props: SluglineEditorProps
) => {
  const editor = useMemo(
    () => withHistory(withReact(createCustomEditor())),
    []
  );

  const [value, setValue] = useState<Descendant[]>(
    props.content_raw || EDITOR_STATE_EMPTY
  );
  const [selection, setSelection] = useState<Range | null>(editor.selection);

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
    <Slate value={value} onChange={setValue} editor={editor}>
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
            className="editor-contenteditable"
            onKeyDown={(evt: React.KeyboardEvent) => {
              EditorHelpers.keyDown(editor, evt);
            }}
            onKeyPress={(evt: React.KeyboardEvent) => {
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
