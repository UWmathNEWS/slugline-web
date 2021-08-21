import { Editor } from "slate";
import createCustomEditor from "../CustomEditor";
import { BlockElementType } from "../types";

describe("normalizeVoidSpacer", () => {
  it("removes void spacers at the beginning of a document", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
    ]);
  });

  it("removes void spacers at the end of a document", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
    ]);
  });

  it("removes multiple void spacers", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
      {
        type: BlockElementType.Default,
        children: [{ text: "TEXT" }],
      },
    ]);
  });
});

describe("normalizeVoidBlock", () => {
  it("adds spacers to void blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Image,
        children: [{ text: "" }],
        src: "image",
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        children: [{ text: "" }],
        src: "image",
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
    ]);
  });

  it("adds back spacers when content is added", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [{ text: "text" }],
      },
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [{ text: "text" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
    ]);
  });

  it("adds only one spacer between void blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "image",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.VoidSpacer,
        children: [{ text: "" }],
      },
    ]);
  });
});

describe("normalizeBlock", () => {
  it("removes empty lists", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.OrderedList,
        children: [],
      },
    ];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [{ text: "" }],
      },
    ]);
  });
});
