import {
  createEditor,
  Element,
  Text,
  Transforms,
  Editor,
  Range,
  Path,
  NodeEntry,
} from "slate";
import {
  SluglineElement,
  InlineElementType,
  Mark,
  BlockElementType,
} from "./types";
import { isListActive, getFirstFromIterable, isListType } from "./helpers";

// the way to remove a property is to call setNodes with the property set to null
// so we create a object with all marks set to null so we can remove them all at once
const REMOVE_ALL_MARKS_OBJ = Object.fromEntries(
  Object.values(Mark).map((mark) => [mark, null])
);

const breakOutOfList = (editor: Editor, path: Path) => {
  // lift the node out of the list and set it to default type
  Transforms.liftNodes(editor);
  Transforms.setNodes(editor, { type: BlockElementType.Default });
  // if the list is now empty, delete it
  const parentPath = path.slice(0, -1);
  const [parentList] = Editor.node(editor, parentPath);
  if ((parentList as SluglineElement).children.length === 0) {
    Transforms.removeNodes(editor, { at: parentPath });
  }
};

const createCustomEditor = () => {
  const editor = createEditor();

  const { addMark, insertBreak, normalizeNode } = editor;

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
        breakOutOfList(editor, path);
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

  const normalizeCustom = (entry: NodeEntry) => {
    const [node, path] = entry;

    // normalization for block elements
    if (Editor.isBlock(editor, node)) {
      const elem = node as SluglineElement;
      // remove lists with no children
      if (isListType(elem.type) && elem.children.length === 0) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    // fallback to default normalization
    normalizeNode(entry);
  };

  editor.isInline = isInline;
  editor.isVoid = isVoid;
  editor.addMark = addMarkMutuallyExclusive;
  editor.insertBreak = insertBreakWithReset;
  editor.normalizeNode = normalizeCustom;
  return editor;
};

export default createCustomEditor;
