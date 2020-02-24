import { Editor } from "slate";
import isHotkey from "is-hotkey";

import { Mark } from "./types";

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
