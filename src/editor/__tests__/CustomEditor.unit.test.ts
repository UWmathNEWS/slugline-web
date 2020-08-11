import createCustomEditor from "../CustomEditor";
import { BlockElementType, Mark } from "../types";

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
