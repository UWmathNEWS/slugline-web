import {
  createEditor,
  Element,
  Text,
  Transforms,
  Editor,
  Range,
  NodeEntry,
} from "slate";
import {
  SluglineElement,
  InlineElementType,
  Mark,
  BlockElementType,
  BlockElement,
} from "./types";
import { isListActive, getFirstFromIterable, isBlockActive } from "./helpers";
import { normalizeBlock, normalizeEditor } from "./normalize";

// the way to remove a property is to call setNodes with the property set to null
// so we create a object with all marks set to null so we can remove them all at once
const REMOVE_ALL_MARKS_OBJ = Object.fromEntries(
  Object.values(Mark).map((mark) => [mark, null])
);

const createCustomEditor = () => {
  const editor = createEditor();

  const {
    addMark,
    insertBreak,
    normalizeNode,
    deleteForward,
    deleteBackward,
  } = editor;

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
      case BlockElementType.Image:
        return true;
      case BlockElementType.VoidSpacer:
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

  const insertBreakWithReset = () => {
    const listActive = isListActive(editor);

    if (listActive && editor.selection && Range.isCollapsed(editor.selection)) {
      // since we're in a list and the selection is collapsed,
      // there is one and only one ListItem that we're inside of
      // and we can assert that this entry exists
      const entry = getFirstFromIterable(
        Editor.nodes<SluglineElement>(editor, {
          match: (node) =>
            (node as SluglineElement).type === BlockElementType.ListItem,
        })
      )!;

      const [, path] = entry;
      // if there's no text in this list item
      if (Editor.string(editor, path) === "") {
        // lift the node out of the list and set it to default type
        Transforms.liftNodes(editor);
        Transforms.setNodes(editor, { type: BlockElementType.Default });
        // don't insert another break after breaking out of a list
        return;
      }
    }

    insertBreak();
    // don't reset the type inside a list so a new list item will be created
    if (!listActive) {
      Transforms.setNodes(editor, { type: BlockElementType.Default });
    }
  };

  /**
   * This function returns true if the currently selected block is a void orphan,
   * that is, an empty paragraph at the very beginning or end of the document
   * before or after a void block and its spacers.
   */
  const isVoidOrphan = () => {
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
      return false;
    }
    if (
      !Editor.isStart(editor, editor.selection.anchor, []) &&
      !Editor.isEnd(editor, editor.selection.anchor, [])
    ) {
      return false;
    }
    if (Editor.string(editor, editor.selection.anchor.path) !== "") {
      return false;
    }
    return true;
  };

  const deleteForwardCustom: typeof deleteForward = (unit) => {
    if (
      editor.selection &&
      Range.isCollapsed(editor.selection) &&
      isBlockActive(editor, BlockElementType.VoidSpacer)
    ) {
      const [nextNode, nextPath] = Editor.next(editor) ?? [
        undefined,
        undefined,
      ];
      if (Editor.isBlock(editor, nextNode) && Editor.isVoid(editor, nextNode)) {
        Transforms.removeNodes(editor, { at: nextPath });
        return;
      }
    }

    if (isVoidOrphan()) {
      Transforms.removeNodes(editor);
      return;
    }

    deleteForward(unit);
  };

  const deleteBackwardCustom: typeof deleteBackward = (unit) => {
    if (
      editor.selection &&
      Range.isCollapsed(editor.selection) &&
      isBlockActive(editor, BlockElementType.VoidSpacer)
    ) {
      const [prevNode, prevPath] = Editor.previous(editor) ?? [
        undefined,
        undefined,
      ];
      if (Editor.isBlock(editor, prevNode) && Editor.isVoid(editor, prevNode)) {
        Transforms.removeNodes(editor, { at: prevPath });
        return;
      }
    }

    if (isVoidOrphan()) {
      Transforms.removeNodes(editor);
      return;
    }

    deleteBackward(unit);
  };

  const normalizeCustom = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (Editor.isEditor(node)) {
      normalizeEditor(node);
    }

    const elem = node as SluglineElement;

    // normalization for block elements
    if (Editor.isBlock(editor, elem)) {
      normalizeBlock(editor, elem as BlockElement, path);
    }

    // fallback to default normalization
    normalizeNode(entry);
  };

  editor.isInline = isInline;
  editor.isVoid = isVoid;
  editor.addMark = addMarkMutuallyExclusive;
  editor.insertBreak = insertBreakWithReset;
  editor.deleteForward = deleteForwardCustom;
  editor.deleteBackward = deleteBackwardCustom;
  editor.normalizeNode = normalizeCustom;
  return editor;
};

export default createCustomEditor;
