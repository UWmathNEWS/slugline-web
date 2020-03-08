import React, { useState, useRef, useEffect } from "react";
import { RenderElementProps, useEditor, ReactEditor } from "slate-react";
import { LinkElement } from "../types";
import LinkPopover from "./LinkPopover";
import { Transforms } from "slate";

const Link: React.FC<RenderElementProps> = (props: RenderElementProps) => {
  const element = props.element as LinkElement;
  const editor = useEditor();

  const [show, setShow] = useState<boolean>(false);
  const ref = useRef<HTMLAnchorElement>(null);

  const setHref = (href: string) => {
    ReactEditor.focus(editor);
    setShow(false);
    const path = ReactEditor.findPath(editor, props.element);
    Transforms.setNodes(
      editor,
      {
        ...element,
        href: href
      },
      {
        at: path
      }
    );
  };

  return (
    <span {...props.attributes}>
      <a
        ref={ref}
        onClick={() => {
          setShow(true);
        }}
        href={element.href}
      >
        {props.children}
      </a>
      {ref.current && (
        <LinkPopover
          href={element.href}
          setHref={setHref}
          show={show}
          target={ref.current}
        />
      )}
    </span>
  );
};

export default Link;
