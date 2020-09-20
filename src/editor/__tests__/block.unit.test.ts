import createCustomEditor from "../CustomEditor";
import { BlockElementType, ImageElement, InlineElementType } from "../types";
import { insertVoidBlock, toggleBlock } from "../helpers";

describe("toggleBlock", () => {
  it("changes the block type", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "fish",
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

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "fish",
          },
        ],
      },
    ]);
  });

  it("toggles multiple blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "fish",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "sticks",
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
        path: [1, 0],
        offset: 6,
      },
    };

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "fish",
          },
        ],
      },
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "sticks",
          },
        ],
      },
    ]);
  });

  it("handles inlines", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "This is a ",
          },
          {
            type: InlineElementType.Link,
            href: "http://google.com",
            children: [
              {
                text: "link",
              },
            ],
          },
          {
            text: "!",
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
        path: [0, 2],
        offset: 1,
      },
    };

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "This is a ",
          },
          {
            type: InlineElementType.Link,
            href: "http://google.com",
            children: [
              {
                text: "link",
              },
            ],
          },
          {
            text: "!",
          },
        ],
      },
    ]);

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "This is a ",
          },
          {
            type: InlineElementType.Link,
            href: "http://google.com",
            children: [
              {
                text: "link",
              },
            ],
          },
          {
            text: "!",
          },
        ],
      },
    ]);
  });

  it("disables the block if any blocks are present", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "Not Header",
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
        path: [1, 0],
        offset: 10,
      },
    };

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "Not Header",
          },
        ],
      },
    ]);
  });

  it("overrides existing blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: "overwrite-me",
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "Not Header",
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
        path: [1, 0],
        offset: 10,
      },
    };

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "Not Header",
          },
        ],
      },
    ]);
  });
});

describe("insertVoidBlock", () => {
  const VOID_BLOCK: ImageElement = {
    type: BlockElementType.Image,
    src: "www.image.com",
    children: [{ text: "" }],
  };

  it("inserts void blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
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
        offset: 2,
      },
      focus: {
        path: [0, 0],
        offset: 2,
      },
    };

    insertVoidBlock(editor, VOID_BLOCK);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "wo",
          },
        ],
      },
      {
        ...VOID_BLOCK,
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "rd",
          },
        ],
      },
    ]);
  });

  it("works in lists", () => {
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
                text: "item 2",
              },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0, 0],
        offset: 2,
      },
      focus: {
        path: [0, 0, 0],
        offset: 2,
      },
    };

    insertVoidBlock(editor, VOID_BLOCK);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "it",
              },
            ],
          },
        ],
      },
      {
        ...VOID_BLOCK,
      },
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "em 1",
              },
            ],
          },
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 2",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("replaces selected text", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "paragraph 1",
          },
        ],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "paragraph 2",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 9,
      },
      focus: {
        path: [1, 0],
        offset: 10,
      },
    };

    insertVoidBlock(editor, VOID_BLOCK);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "paragraph",
          },
        ],
      },
      {
        ...VOID_BLOCK,
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "2",
          },
        ],
      },
    ]);
  });
});
