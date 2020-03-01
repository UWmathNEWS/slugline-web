import { Editor, Transforms, Element, Range } from "slate";
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

export function createLink(editor: Editor, href: string): void {
  const newLink: LinkElement = {
    href: href,
    type: ElementType.Link,
    children: [{ text: href }]
  };
  Transforms.insertNodes(editor, newLink);
}

export function wrapLink(editor: Editor, href: string): void {
  const newLink: LinkElement = {
    href: href,
    type: ElementType.Link,
    children: []
  };
  Transforms.wrapNodes(editor, newLink, {
    split: true
  });
}

export function toggleLink(editor: Editor, href: string): void {
  const selection = editor.selection;
  if (!selection) {
    createLink(editor, href);
  } else {
    const linkNodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: node => (node as SluglineElement).type === ElementType.Link
      })
    );
    //only insert new links if a link isn't already selected
    if (linkNodes.length === 0) {
      if (Range.isCollapsed(selection)) {
        createLink(editor, href);
      } else {
        wrapLink(editor, href);
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
