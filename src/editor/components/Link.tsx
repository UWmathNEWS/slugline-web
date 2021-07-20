import React, { useState, useRef } from "react";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { LinkElement } from "../types";
import LinkPopover from "./LinkPopover";
import { Transforms } from "slate";
import PopoverWrapper from "./PopoverWrapper";

// Taken from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
// Basically enforces <anything>@<anything>.<anything>
const EMAIL_REGEX = /\S+@\S+\.\S+/;

export const formatHref = (href: string) => {
  if (href.match(EMAIL_REGEX)) {
    if (!href.startsWith("mailto:")) {
      return "mailto:" + href;
    }
  } else if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return "http://" + href;
  }

  return href;
};

const Link: React.FC<RenderElementProps> = (props: RenderElementProps) => {
  const element = props.element as LinkElement;
  const editor = useSlateStatic();

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
        href: href,
      },
      {
        at: path,
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
        href={formatHref(element.href)}
      >
        {props.children}
      </a>
      {ref.current && (
        <PopoverWrapper show={show} target={ref.current} setShow={setShow}>
          <LinkPopover href={element.href} setHref={setHref} />
        </PopoverWrapper>
      )}
    </span>
  );
};

export default Link;
