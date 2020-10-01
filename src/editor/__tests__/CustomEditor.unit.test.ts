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

describe("insertBreakWithReset", () => {
  it("resets paragraph type after inserting a break at the end", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "HEADER",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 6,
      },
      focus: {
        path: [0, 0],
        offset: 6,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "HEADER",
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

  it("resets paragraph type after inserting a break in the middle", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "HEADER",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 3,
      },
      focus: {
        path: [0, 0],
        offset: 3,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "HEA",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "DER",
          },
        ],
      },
    ]);
  });

  it("doesn't reset paragraph type in a list", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 1",
              },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0, 0],
        offset: 6,
      },
      focus: {
        path: [0, 0, 0],
        offset: 6,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 1",
              },
            ],
          },
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("exits the list when in an empty list item", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 1",
              },
            ],
          },
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "",
              },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 1, 0],
        offset: 0,
      },
      focus: {
        path: [0, 1, 0],
        offset: 0,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 1",
              },
            ],
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

  it("deletes a list when removing the only item", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "",
              },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0, 0],
        offset: 0,
      },
    };

    editor.insertBreak();

    expect(editor.children).toEqual([
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

  it("creates new paragraphs when a void block is selected", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
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

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Default,
        children: [{ text: "" }],
      },
    ]);
  });
});
