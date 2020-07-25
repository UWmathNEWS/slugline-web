import createCustomEditor from "../CustomEditor";
import { InlineElementType, BlockElementType, Mark } from "../types";
import { Children } from "react";
import { Editor } from "slate";
import { formatHref } from "../components/Link";
import EditorPage from "../../dash/EditorPage";

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
});
