import { Editor, Transforms, Range } from "slate";
import isHotkey from "is-hotkey";

import {
  Mark,
  InlineElement,
  SluglineElement,
  InlineVoidElement,
  BlockElementType,
  InlineElementType,
  ElementType,
  ListElementType,
  BlockVoidElement,
  CustomEditor,
} from "./types";
import { HistoryEditor } from "slate-history";

export const isMarkActive = (editor: Editor, mark: Mark): boolean => {
  const marks = Editor.marks(editor);
  return marks !== null && marks[mark] === true;
};

export const toggleMark = (editor: CustomEditor, mark: Mark): void => {
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
export const isIterableEmpty = (iterable: Iterable<any>) => {
  // this is weird but its faster than converting the iterable to an array then
  // checking its length
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of iterable) {
    return false;
  }
  return true;
};

/**
 * Returns the first item in `iterable`. Returns `undefined` for an empty iterable.
 * @param iterable The iterable to return the first item of.
 */
export const getFirstFromIterable = <T>(iterable: Iterable<T>) => {
  for (const i of iterable) {
    return i;
  }
};

/**
 * Returns true if the passed Location contains inlines, and false otherwise
 * @param editor The editor to search in.
 * @param at The location to search at. If at is undefined, the current selection
 * will be used instead.
 */
export const hasInlines = (editor: Editor, type?: InlineElementType) => {
  const inlines = Editor.nodes(editor, {
    mode: "all",
    match: (node) =>
      Editor.isInline(editor, node) &&
      (!type || (node as SluglineElement).type === type),
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
    case BlockElementType.Header1:
    case BlockElementType.Header2:
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

  // triple-click creates a "hanging selection", which technically runs into the next
  // paragraph, resulting in the selected paragraph and the following one being
  // converted to a link. We "unhang" the selection to prevent this.
  if (editor.selection) {
    editor.selection = Editor.unhangRange(editor, editor.selection);
  }

  if (editor.selection === null || Range.isCollapsed(editor.selection)) {
    const inlineWithChildren: InlineElement | InlineVoidElement = {
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
    // since we're wrapping existing nodes, the children property will be ignored
    const inlineWithoutChildren: InlineElement | InlineVoidElement = {
      ...inline,
      children: [{ text: "" }],
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

/**
 * Unwraps inlines of the type given to just normal text.
 * @param editor The editor to operate on.
 * @param type The type of inline to unwrap. Other types of inline will be unaffected.
 */
export const unwrapInline = (editor: Editor, type: InlineElementType) => {
  Transforms.unwrapNodes(editor, {
    match: (node) => (node as SluglineElement).type === type,
  });
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
  const isActive = isBlockActive(editor, blockType);

  Editor.withoutNormalizing(editor, () => {
    // first, unwrap any lists
    if (isListActive(editor)) {
      Transforms.unwrapNodes(editor, {
        split: true,
        match: (elem) => isListType((elem as SluglineElement).type),
      });
      Transforms.setNodes(
        editor,
        { type: BlockElementType.Default },
        {
          match: (elem) =>
            (elem as SluglineElement).type === BlockElementType.ListItem,
        }
      );
    }

    // if the requested block is a list and that list is currently not active,
    // we are toggling a list ON, and we have to do some wrapping
    if (isListType(blockType) && !isActive) {
      wrapListItems(editor, blockType);
    } else if (isActive) {
      // otherwise, toggle as usual
      Transforms.setNodes(
        editor,
        { type: BlockElementType.Default },
        {
          mode: "all",
          match: (node) =>
            !editor.isVoid(node as SluglineElement) &&
            Editor.isBlock(editor, node),
        }
      );
    } else {
      Transforms.setNodes(
        editor,
        { type: blockType },
        {
          mode: "all",
          match: (node) =>
            !editor.isVoid(node as SluglineElement) &&
            Editor.isBlock(editor, node),
        }
      );
    }
  });
};

/**
 * Wraps the currently selected blocks into a list, skipping void blocks
 * @param editor The editor to wrap blocks in
 * @param listType The type of list to wrap the blocks with
 */
const wrapListItems = (editor: Editor, listType: ListElementType) => {
  Transforms.setNodes(
    editor,
    { type: BlockElementType.ListItem },
    {
      match: (elem) =>
        !editor.isVoid(elem as SluglineElement) && Editor.isBlock(editor, elem),
    }
  );

  Transforms.wrapNodes(editor, { type: listType, children: [] });

  // we don't want to wrap void nodes, so pull them out after the fact
  Transforms.liftNodes(editor, {
    mode: "all",
    match: (elem) => editor.isVoid(elem as SluglineElement),
  });
};

export const isListActive = (editor: Editor) => {
  return (
    isBlockActive(editor, BlockElementType.OrderedList) ||
    isBlockActive(editor, BlockElementType.UnorderedList)
  );
};

export const isListType = (
  blockType: ElementType
): blockType is ListElementType => {
  return (
    blockType === BlockElementType.UnorderedList ||
    blockType === BlockElementType.OrderedList
  );
};

/**
 * Inserts a void block element at the current selection.
 * @param editor The editor to insert the block into
 * @param block The block to insert. The `children` property will not be inserted.
 */
export const insertVoidBlock = (editor: Editor, block: BlockVoidElement) => {
  Editor.withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }
    const selectionRef = Editor.rangeRef(editor, editor.selection);
    Transforms.insertNodes(editor, block, {
      mode: "highest",
    });
    if (
      Range.isCollapsed(selectionRef.current!) &&
      Editor.string(editor, selectionRef.current!.anchor.path) === ""
    ) {
      Transforms.removeNodes(editor, {
        at: selectionRef.current!,
        mode: "highest",
      });
    }
  });
};

const MARK_HOTKEYS: Array<[Mark, string]> = [
  [Mark.Strikethrough, "mod+d"],
  [Mark.ArticleRef, "mod+q"],
  [Mark.Stress1, "mod+b"],
  [Mark.Emph1, "mod+i"],
];

export const keyDown = (
  editor: CustomEditor,
  evt: React.KeyboardEvent
): void => {
  MARK_HOTKEYS.forEach(([mark, hotkey]) => {
    if (isHotkey(hotkey, evt.nativeEvent)) {
      toggleMark(editor, mark);
    }
  });
  if (isHotkey("shift+enter", evt.nativeEvent)) {
    editor.insertText("\n");
    evt.preventDefault();
  }
};

export const keyPressed = (
  editor: CustomEditor,
  evt: React.KeyboardEvent
): void => {
  if (isHotkey("mod+z", evt.nativeEvent)) {
    editor.undo();
  }
  if (isHotkey("mod+y", evt.nativeEvent)) {
    editor.redo();
  }
};

export const isSelectionCollapsed = (editor: Editor) =>
  editor.selection && Range.isCollapsed(editor.selection);
