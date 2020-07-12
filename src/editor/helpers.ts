import { Editor, Transforms, Location, Range } from "slate";
import isHotkey from "is-hotkey";

import {
  Mark,
  InlineElement,
  SluglineElement,
  ElementType,
  InlineVoidElement,
} from "./types";

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

const clearAllStress = (editor: Editor) => {
  Editor.removeMark(editor, Mark.Stress1);
  Editor.removeMark(editor, Mark.Stress2);
};

const clearAllEmph = (editor: Editor) => {
  Editor.removeMark(editor, Mark.Emph1);
  Editor.removeMark(editor, Mark.Emph2);
  Editor.removeMark(editor, Mark.Emph3);
  Editor.removeMark(editor, Mark.Emph4);
};

export const increaseStress = (editor: Editor) => {
  clearAllEmph(editor);

  if (isMarkActive(editor, Mark.Stress1)) {
    clearAllStress(editor);
    editor.addMark(Mark.Stress2, true);
  } else if (isMarkActive(editor, Mark.Stress2)) {
    clearAllStress(editor);
  } else {
    // no marks at all, add the first level
    editor.addMark(Mark.Stress1, true);
  }
};

export const increaseEmph = (editor: Editor) => {
  clearAllStress(editor);

  if (isMarkActive(editor, Mark.Emph1)) {
    clearAllEmph(editor);
    editor.addMark(Mark.Emph2, true);
  } else if (isMarkActive(editor, Mark.Emph2)) {
    clearAllEmph(editor);
    editor.addMark(Mark.Emph3, true);
  } else if (isMarkActive(editor, Mark.Emph3)) {
    clearAllEmph(editor);
    editor.addMark(Mark.Emph4, true);
  } else if (isMarkActive(editor, Mark.Emph4)) {
    clearAllEmph(editor);
  } else {
    editor.addMark(Mark.Emph1, true);
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

export const getDefaultElementText = (element: SluglineElement) => {
  switch (element.type) {
    case ElementType.Default:
      return "lorem ipsum";
    case ElementType.Link:
      return element.href;
    case ElementType.InlineLatex:
      return "\\LaTeX";
    case ElementType.Header:
      return "HEADER";
    default:
      return "lorem ipsum";
  }
};

/**
 * Creates an inline, non-void element at the editor's current selection. Any children
 * of this element will be overwritten.
 * @param editor The editor to add the inline to.
 * @param inline The inline to be added.
 * @param text The text to set as the child of the inline element. If this is undefined,
 * the existing text at the insert location will be used. If there is no text at that
 * location, the inline will have no text.
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

export const isBlockActive = (editor: Editor, blockType: ElementType) => {
  return !isIterableEmpty(
    Editor.nodes(editor, {
      match: (node) => (node as SluglineElement).type === blockType,
    })
  );
};

export const toggleBlock = (editor: Editor, blockType: ElementType) => {
  if (isBlockActive(editor, blockType)) {
    Transforms.setNodes(editor, { type: "paragraph" });
  } else {
    Transforms.setNodes(editor, { type: blockType });
  }
};

const MARK_HOTKEYS: Array<[Mark, string]> = [
  [Mark.Strikethrough, "mod+d"],
  [Mark.Code, "mod+`"],
];

export const keyDown = (editor: Editor, evt: React.KeyboardEvent): void => {
  MARK_HOTKEYS.forEach(([mark, hotkey]) => {
    if (isHotkey(hotkey, evt.nativeEvent)) {
      toggleMark(editor, mark);
    }
  });
  if (isHotkey("mod+b", evt.nativeEvent)) {
    increaseStress(editor);
  }
  if (isHotkey("mod+i", evt.nativeEvent)) {
    increaseEmph(editor);
  }
};
