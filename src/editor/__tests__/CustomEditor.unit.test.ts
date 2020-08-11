import createCustomEditor from "../CustomEditor";
import { BlockElementType, Mark } from "../types";
import { create } from "domain";

describe("addMarkMutuallyExclusive", () => {
  it("adds marks like normal", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am some mark text",
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
        offset: 19,
      },
    };
    editor.addMark(Mark.Emph1, true);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am some mark text",
            [Mark.Emph1]: true,
          },
        ],
      },
    ]);
  });

  it("removes existing marks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am some mark text",
            [Mark.Emph3]: true,
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
        offset: 19,
      },
    };
    editor.addMark(Mark.Emph1, true);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am some mark text",
            [Mark.Emph1]: true,
          },
        ],
      },
    ]);
  });

  it("splits existing marks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am some mark text",
            [Mark.Emph3]: true,
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 5,
      },
      focus: {
        path: [0, 0],
        offset: 14,
      },
    };
    editor.addMark(Mark.Emph1, true);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "i am ",
            [Mark.Emph3]: true,
          },
          {
            text: "some mark",
            [Mark.Emph1]: true,
          },
          {
            text: " text",
            [Mark.Emph3]: true,
          },
        ],
      },
    ]);
  });

  it("clears marks over multiple nodes", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "some text",
            [Mark.Emph3]: true,
          },
          {
            text: "some more text",
            [Mark.ArticleRef]: true,
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 5,
      },
      focus: {
        path: [0, 1],
        offset: 4,
      },
    };
    editor.addMark(Mark.Emph1, true);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "some ",
            [Mark.Emph3]: true,
          },
          {
            text: "textsome",
            [Mark.Emph1]: true,
          },
          {
            text: " more text",
            [Mark.ArticleRef]: true,
          },
        ],
      },
    ]);
  });
});

describe("addBreakCustom", () => {
  it("adds soft breaks in the right blocks", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code code code",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 4,
      },
      focus: {
        path: [0, 0],
        offset: 4,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "code\n code code",
          },
        ],
      },
    ]);

    editor.children = [
      {
        type: BlockElementType.Header,
        children: [
          {
            text: "code code code",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 4,
      },
      focus: {
        path: [0, 0],
        offset: 4,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header,
        children: [
          {
            text: "code",
          },
        ],
      },
      {
        type: BlockElementType.Header,
        children: [
          {
            text: " code code",
          },
        ],
      },
    ]);
  });

  it("doesn't add soft breaks if multiple elements are selected", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "first",
          },
        ],
      },
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "second",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "third",
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 4,
      },
      focus: {
        path: [2, 0],
        offset: 1,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "firs",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "hird",
          },
        ],
      },
    ]);
  });
});
