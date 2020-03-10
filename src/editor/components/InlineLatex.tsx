import React, { useRef, useEffect } from "react";
import { RenderElementProps } from "slate-react";
import { InlineLatexElement } from "../types";
import * as katex from "katex";

const InlineLatex: React.FC<RenderElementProps> = (
  props: RenderElementProps
) => {
  const element = props.element as InlineLatexElement;

  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(element.latex, ref.current, {
        throwOnError: false
      });
    }
  }, [ref, element.latex]);

  return (
    <span {...props.attributes}>
      <span ref={ref}></span>
      {props.children}
    </span>
  );
};

export default InlineLatex;
