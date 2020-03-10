import { Editor, Transforms, Element, Range, Node, Text } from "slate";
import isHotkey from "is-hotkey";

import { Mark, ElementType, LinkElement, SluglineElement } from "./types";
import { Transform } from "stream";

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

export function createInline(editor: Editor, inline: SluglineElement): void {
  Transforms.insertNodes(editor, inline);
}

export function wrapInline(editor: Editor, inline: SluglineElement): void {
  // remove any children since we're wrapping an existing node
  const topLevel = {
    ...inline,
    children: []
  };
  console.log(topLevel);
  Transforms.wrapNodes(editor, topLevel, {
    split: true
  });
}

export function toggleInline(editor: Editor, inline: SluglineElement): void {
  const selection = editor.selection;
  if (!selection) {
    createInline(editor, inline);
  } else {
    const linkNodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        mode: "lowest"
      })
    );
    //only insert new inlines if we're not in any non text nodes
    if (linkNodes.every(([node, path]) => Text.isText(node))) {
      if (Range.isCollapsed(selection)) {
        createInline(editor, inline);
      } else {
        wrapInline(editor, inline);
      }
    }
  }
}

const MARK_HOTKEYS: Array<[Mark, string]> = [
  [Mark.Bold, "mod+b"],
  [Mark.Italic, "mod+i"],
  [Mark.Underline, "mod+u"],
  [Mark.Strikethrough, "mod+d"],
  [Mark.Code, "mod+`"]
];

export function keyDown(editor: Editor, evt: React.KeyboardEvent): void {
  MARK_HOTKEYS.forEach(([mark, hotkey]) => {
    if (isHotkey(hotkey, evt.nativeEvent)) {
      toggleMark(editor, mark);
    }
  });
}
