import createCustomEditor from "../CustomEditor";
import { BlockElementType } from "../types";
import { toggleBlock } from "../helpers";

describe("lists", () => {
  it("toggles single blocks into single item lists", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "item 1",
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

    toggleBlock(editor, BlockElementType.UnorderedList);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.UnorderedList,
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
    ]);
  });

  it("toggles multiple blocks into multiple item lists", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "item 1",
          },
        ],
      },
      {
        type: BlockElementType.Code,
        children: [
          {
            text: "item 2",
          },
        ],
      },
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "item 3",
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
        path: [2, 0],
        offset: 6,
      },
    };

    toggleBlock(editor, BlockElementType.UnorderedList);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.UnorderedList,
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
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("converts between list types", () => {
    const editor = createCustomEditor();

    editor.children = [
      {
        type: BlockElementType.UnorderedList,
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
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
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
        path: [0, 2, 0],
        offset: 6,
      },
    };

    toggleBlock(editor, BlockElementType.OrderedList);

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
                text: "item 2",
              },
            ],
          },
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("splits lists when toggling individual items", () => {
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
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
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

    toggleBlock(editor, BlockElementType.Header1);

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
        type: BlockElementType.Header1,
        children: [
          {
            text: "item 2",
          },
        ],
      },
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("correctly removes entire lists", () => {
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
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
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
        path: [0, 2, 0],
        offset: 6,
      },
    };

    toggleBlock(editor, BlockElementType.Header1);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "item 1",
          },
        ],
      },
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "item 2",
          },
        ],
      },
      {
        type: BlockElementType.Header1,
        children: [
          {
            text: "item 3",
          },
        ],
      },
    ]);
  });

  it("doesn't wrap void blocks in the middle", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "item 1",
          },
        ],
      },
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "item 3",
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
        path: [2, 0],
        offset: 6,
      },
    };

    toggleBlock(editor, BlockElementType.OrderedList);

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
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.OrderedList,
        children: [
          {
            type: BlockElementType.ListItem,
            children: [
              {
                text: "item 3",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("doesn't wrap all void blocks", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
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
        path: [2, 0],
        offset: 0,
      },
    };

    toggleBlock(editor, BlockElementType.ListItem);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
      {
        type: BlockElementType.Image,
        src: "www.image.com",
        children: [{ text: "" }],
      },
    ]);
  });
});
