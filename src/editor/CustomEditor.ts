import { createEditor, Element } from "slate";
import { SluglineElement, ElementType } from "./types";

const isInline = (element: Element) => {
  const e = element as SluglineElement;
  switch (e.type) {
    case ElementType.Link:
      return true;
    case ElementType.InlineLatex:
      return true;
    default:
      return false;
  }
};

const isVoid = (element: Element) => {
  const e = element as SluglineElement;
  switch (e.type) {
    case ElementType.InlineLatex:
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
