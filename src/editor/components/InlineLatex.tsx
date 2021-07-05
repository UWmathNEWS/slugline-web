import React, { useRef, useEffect, useState } from "react";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { InlineLatexElement } from "../types";
import * as katex from "katex";
import PopoverWrapper from "./PopoverWrapper";
import LatexPopover from "./LatexPopover";
import { Transforms } from "slate";

const InlineLatex: React.FC<RenderElementProps> = (
  props: RenderElementProps
) => {
  const element = props.element as InlineLatexElement;
  const editor = useSlateStatic();

  const [show, setShow] = useState<boolean>(false);

  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(element.latex, ref.current, {
        throwOnError: false,
      });
    }
  }, [ref, element.latex]);

  const setLatex = (latex: string) => {
    ReactEditor.focus(editor);
    setShow(false);
    const path = ReactEditor.findPath(editor, props.element);
    Transforms.setNodes(editor, { latex: latex }, { at: path });
  };

  return (
    <>
      <span {...props.attributes}>
        <span
          ref={ref}
          onClick={() => {
            setShow(true);
          }}
        ></span>
        {props.children}
      </span>
      {ref.current && (
        <PopoverWrapper show={show} target={ref.current} setShow={setShow}>
          <LatexPopover latex={element.latex} setLatex={setLatex} />
        </PopoverWrapper>
      )}
    </>
  );
};

export default InlineLatex;
