import { createEditor, Element, Text, Transforms, Editor, Path } from "slate";
import {
  SluglineElement,
  InlineElementType,
  ElementType,
  Mark,
  BlockElementType,
} from "./types";
import { isIterableEmpty } from "./helpers";

// the way to remove a property is to call setNodes with the property set to null
// so we create a object with all marks set to null so we can remove them all at once
const REMOVE_ALL_MARKS_OBJ = Object.fromEntries(
  Object.values(Mark).map((mark) => [mark, null])
);

// Any element in this list will create a soft break on ENTER, instead of creating a new block
const SOFT_BREAK_ELEMENTS: ElementType[] = [BlockElementType.Code];

const createCustomEditor = () => {
  const editor = createEditor();

  const { addMark, insertBreak } = editor;

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

  const insertBreakCustom = () => {
    if (
      editor.selection &&
      Path.equals(editor.selection.anchor.path, editor.selection.focus.path)
    ) {
      const nodes = Editor.nodes(editor, {
        match: (elem) =>
          SOFT_BREAK_ELEMENTS.includes((elem as SluglineElement).type),
      });
      if (!isIterableEmpty(nodes)) {
        editor.insertText("\n");
        return;
      }
    }
    insertBreak();
  };

  editor.isInline = isInline;
  editor.isVoid = isVoid;
  editor.addMark = addMarkMutuallyExclusive;
  editor.insertBreak = insertBreakCustom;
  return editor;
};

export default createCustomEditor;
