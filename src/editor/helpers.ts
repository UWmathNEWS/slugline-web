import { Editor, Transforms, Location, Range, Path, Text } from "slate";
import isHotkey from "is-hotkey";

import {
  Mark,
  InlineElement,
  SluglineElement,
  ElementType,
  InlineVoidElement,
} from "./types";

export function isMarkActive(editor: Editor, mark: Mark): boolean {
  const marks = Editor.marks(editor);
  return marks !== null && marks[mark] === true;
}

export function toggleMark(editor: Editor, mark: Mark): void {
  const active = isMarkActive(editor, mark);
  if (active) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

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
    text = text ?? getDefaultElementText(inline);
    const inlineWithChildren = {
      ...inline,
      children: [
        {
          text: text,
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

const MARK_HOTKEYS: Array<[Mark, string]> = [
  [Mark.Bold, "mod+b"],
  [Mark.Italic, "mod+i"],
  [Mark.Underline, "mod+u"],
  [Mark.Strikethrough, "mod+d"],
  [Mark.Code, "mod+`"],
];

export function keyDown(editor: Editor, evt: React.KeyboardEvent): void {
  MARK_HOTKEYS.forEach(([mark, hotkey]) => {
    if (isHotkey(hotkey, evt.nativeEvent)) {
      toggleMark(editor, mark);
    }
  });
}
