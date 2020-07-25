import { createEditor, Element, Editor, Text, Transforms } from "slate";
import { SluglineElement, InlineElementType, Mark } from "./types";

// the way to remove a property is to call setNodes with the property set to null
// so we create a object with all marks set to null so we can remove them all at once
const REMOVE_ALL_MARKS_OBJ = Object.fromEntries(
  Object.values(Mark).map((mark) => [mark, null])
);

const createCustomEditor = () => {
  const editor = createEditor();

  const { addMark } = editor;

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

  const addMarkMutuallyExclusive = (key: string, value: any) => {
    Transforms.setNodes(editor, REMOVE_ALL_MARKS_OBJ, {
      split: true,
      match: Text.isText,
    });
    return addMark(key, value);
  };

  editor.isInline = isInline;
  editor.isVoid = isVoid;
  editor.addMark = addMarkMutuallyExclusive;
  return editor;
};

export default createCustomEditor;
