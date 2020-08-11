import createCustomEditor from "../CustomEditor";
import { BlockElementType } from "../types";
import { attemptArrowOut } from "../helpers";

describe("attemptArrowOut", () => {
  it("only arrows out of soft break blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    attemptArrowOut(editor);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "",
          },
        ],
      },
    ]);
  });

  it("does not arrow out of non soft break blocks", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Header,
        children: [
          {
            text: "code",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    attemptArrowOut(editor);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header,
        children: [
          {
            text: "code",
          },
        ],
      },
    ]);
  });

  it("only arrows out of the very last block", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "word",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    attemptArrowOut(editor);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "word",
          },
        ],
      },
    ]);
  });

  it("only arrows out of the very last line in the block", () => {
    const editor = createCustomEditor();

    const CONTENT = [
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code\ncode\ncode",
          },
        ],
      },
    ];

    editor.children = CONTENT;

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    attemptArrowOut(editor);
    expect(editor.children).toEqual(CONTENT);

    editor.selection.anchor.offset = 9;
    editor.selection.focus.offset = 9;

    attemptArrowOut(editor);
    expect(editor.children).toEqual(CONTENT);
  });
});
