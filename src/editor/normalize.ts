import { Editor, Node, Path, Transforms } from "slate";
import { isListType } from "./helpers";
import { BlockElement, BlockElementType, SluglineElement } from "./types";

const normalizeVoidSpacer = (editor: Editor, path: Path) => {
  const prevEntry = Editor.previous(editor, { at: path });
  const prevElem = prevEntry && (prevEntry[0] as SluglineElement);

  const nextEntry = Editor.next(editor, { at: path });
  const nextElem = nextEntry && (nextEntry[0] as SluglineElement);

  // if there's a void node before or after the spacer, we don't have to do anything
  if (
    prevElem &&
    Editor.isBlock(editor, prevElem) &&
    Editor.isVoid(editor, prevElem) &&
    prevElem.type !== BlockElementType.VoidSpacer
  ) {
    return;
  }

  if (
    Editor.isBlock(editor, nextElem) &&
    Editor.isVoid(editor, nextElem) &&
    nextElem.type !== BlockElementType.VoidSpacer
  ) {
    return;
  }

  // otherwise, remove the node
  Transforms.removeNodes(editor, { at: path });
};

const normalizeVoidBlock = (editor: Editor, path: Path) => {
  const pathRef = Editor.pathRef(editor, path);

  const prevEntry =
    pathRef.current &&
    Editor.previous(editor, {
      at: pathRef.current,
      mode: "highest",
    });

  if (!prevEntry) {
    Transforms.insertNodes(
      editor,
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        at: [0],
        mode: "highest",
      }
    );
  } else {
    const [prevNode, prevPath] = prevEntry;
    if ((prevNode as SluglineElement).type !== BlockElementType.VoidSpacer) {
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.VoidSpacer,
          children: [{ text: "" }],
        },
        { at: Editor.end(editor, prevPath), mode: "highest" }
      );
    }
  }

  const nextEntry =
    pathRef.current &&
    Editor.next(editor, { at: pathRef.current, mode: "highest" });

  if (!nextEntry) {
    // insert a void spacer at the end of the document
    Transforms.insertNodes(
      editor,
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        at: Editor.end(editor, []),
      }
    );
  } else {
    const [nextNode, nextPath] = nextEntry;
    if ((nextNode as SluglineElement).type !== BlockElementType.VoidSpacer) {
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.VoidSpacer,
          children: [{ text: "" }],
        },
        { at: Editor.before(editor, nextPath), mode: "highest" }
      );
    }
  }
};

/**
 * Normalizes the editor, i.e., the top-level container that holds all blocks.
 * This handles top-level layout.
 * @param editor The editor to normalize
 */
export const normalizeEditor = (editor: Editor) => {
  for (const [node, path] of Node.children(editor, [])) {
    if (Editor.isBlock(editor, node) && Editor.isVoid(editor, node)) {
      const elem = node as SluglineElement;
      if (elem.type === BlockElementType.VoidSpacer) {
        normalizeVoidSpacer(editor, path);
      } else {
        normalizeVoidBlock(editor, path);
      }
    }
  }
};

export const normalizeBlock = (
  editor: Editor,
  block: BlockElement,
  path: Path
) => {
  // remove lists with no children
  if (isListType(block.type) && block.children.length === 0) {
    Transforms.removeNodes(editor, { at: path });
    return;
  }
};
