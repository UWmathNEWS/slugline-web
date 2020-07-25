import { Editor, Transforms, Location, Range } from "slate";
import isHotkey from "is-hotkey";

import {
  Mark,
  InlineElement,
  SluglineElement,
  InlineVoidElement,
  BlockElementType,
  InlineElementType,
} from "./types";
import { HistoryEditor } from "slate-history";

export const isMarkActive = (editor: Editor, mark: Mark): boolean => {
  const marks = Editor.marks(editor);
  return marks !== null && marks[mark] === true;
};

export const toggleMark = (editor: Editor, mark: Mark): void => {
  const active = isMarkActive(editor, mark);
  if (active) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};

/**
 * Returns true if `iterable` has no elements.
 * @param iterable The iterable to check
 */
const isIterableEmpty = (iterable: Iterable<any>) => {
  // this is weird but its faster than converting the iterable to an array then
  // checking its length
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of iterable) {
    return false;
  }
  return true;
};

/**
 * Returns true if the passed Location contains inlines, and false otherwise
 * @param editor The editor to search in.
 * @param at The location to search at. If at is undefined, the current selection
 * will be used instead.
 */
export const hasInlines = (editor: Editor, at?: Location) => {
  const inlines = Editor.nodes(editor, {
    at: at,
    mode: "all",
    match: (node) => Editor.isInline(editor, node),
  });
  return !isIterableEmpty(inlines);
};

export const getDefaultElementText = (element: SluglineElement): string => {
  switch (element.type) {
    case BlockElementType.Default:
      return "lorem ipsum";
    case InlineElementType.Link:
      return element.href;
    case InlineElementType.InlineLatex:
      return "\\LaTeX";
    case BlockElementType.Header:
      return "HEADER";
    default:
      return "lorem ipsum";
  }
};

/**
 * Creates an inline element at the editor's current selection. Any children
 * of this element will be overwritten.
 * @param editor The editor to add the inline to.
 * @param inline The inline to be added.
 * @param text The text to set as the child of the inline element. If this is undefined,
 * the existing text at the insert location will be used. If there is no text at that
 * location, the inline will have default text depending on its type.
 */
export const createInline: {
  (editor: Editor, inline: InlineElement, text?: string): void;
  (editor: Editor, inline: InlineVoidElement): void;
} = (
  editor: Editor,
  inline: InlineElement | InlineVoidElement,
  text?: string
) => {
  // only create inlines if the selection doesn't have any already
  if (hasInlines(editor)) {
    return;
  }

  if (editor.selection === null || Range.isCollapsed(editor.selection)) {
    const inlineWithChildren = {
      ...inline,
      children: [
        {
          text: text ?? getDefaultElementText(inline),
        },
      ],
    };
    Transforms.insertNodes(editor, inlineWithChildren);
  } else {
    // we have an expanded range, wrap the existing nodes
    // since we're wrapping existing nodes, no children allowed
    const inlineWithoutChildren = {
      ...inline,
      children: [],
    };
    Transforms.wrapNodes(editor, inlineWithoutChildren, {
      split: true,
    });
    if (editor.isVoid(inline)) {
      // void nodes must have one child text node, so set it to empty
      Transforms.insertText(editor, "", { voids: true });
    } else if (text) {
      Transforms.insertText(editor, text);
    }
  }
};

export const isBlockActive = (editor: Editor, blockType: BlockElementType) => {
  return !isIterableEmpty(
    Editor.nodes(editor, {
      match: (node) => (node as SluglineElement).type === blockType,
      mode: "all",
    })
  );
};

/**
 * If the selection does not contain a block of type `blockType`, set
 * all blocks in the selection to type `blockType`. Otherwise, set all
 * blocks in the selection to the default type.
 * @param editor The editor to toggle the block on
 * @param blockType The type of block to toggle
 */
export const toggleBlock = (editor: Editor, blockType: BlockElementType) => {
  if (isBlockActive(editor, blockType)) {
    Transforms.setNodes(
      editor,
      { type: BlockElementType.Default },
      { mode: "all", match: (node) => Editor.isBlock(editor, node) }
    );
  } else {
    Transforms.setNodes(
      editor,
      { type: blockType },
      { mode: "all", match: (node) => Editor.isBlock(editor, node) }
    );
  }
};

const MARK_HOTKEYS: Array<[Mark, string]> = [
  [Mark.Strikethrough, "mod+d"],
  [Mark.Code, "mod+`"],
  [Mark.ArticleRef, "mod+q"],
  [Mark.Stress1, "mod+b"],
  [Mark.Emph1, "mod+i"],
];

export const keyDown = (
  editor: HistoryEditor,
  evt: React.KeyboardEvent
): void => {
  MARK_HOTKEYS.forEach(([mark, hotkey]) => {
    if (isHotkey(hotkey, evt.nativeEvent)) {
      toggleMark(editor, mark);
    }
  });
  if (isHotkey("mod+z", evt.nativeEvent)) {
    editor.undo();
  }
  if (isHotkey("mod+y", evt.nativeEvent)) {
    editor.redo();
  }
};
