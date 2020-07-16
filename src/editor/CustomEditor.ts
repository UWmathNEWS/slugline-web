import { createEditor, Element } from "slate";
import { SluglineElement, InlineElementType } from "./types";

const isInline = (element: Element) => {
  const e = element as SluglineElement;
  switch (e.type) {
    case InlineElementType.Link:
      return true;
    case InlineElementType.InlineLatex:
      return true;
    default:
      return false;
  }
};

const isVoid = (element: Element) => {
  const e = element as SluglineElement;
  switch (e.type) {
    case InlineElementType.InlineLatex:
      return true;
    default:
      return false;
  }
};

const createCustomEditor = () => {
  const editor = createEditor();
  editor.isInline = isInline;
  editor.isVoid = isVoid;
  return editor;
};

export default createCustomEditor;
