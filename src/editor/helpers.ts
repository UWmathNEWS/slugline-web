import { Editor } from "slate";
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
