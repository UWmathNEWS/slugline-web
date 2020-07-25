import { createEditor, Element, Editor } from "slate";
import { SluglineElement, InlineElementType, Mark } from "./types";
import { isMarkActive } from "./helpers";

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
    const currentMarks = Editor.marks(editor);
    if (currentMarks) {
      for (const [mark] of Object.entries(currentMarks)) {
        Editor.removeMark(editor, mark);
      }
    }
    return addMark(key, value);
  };

  editor.isInline = isInline;
  editor.isVoid = isVoid;
  editor.addMark = addMarkMutuallyExclusive;
  return editor;
};

export default createCustomEditor;
