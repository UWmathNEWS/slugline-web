import createCustomEditor from "../CustomEditor";
import { ElementType } from "../types";
import { toggleBlock } from "../helpers";

describe("toggleBlock", () => {
  it("changes the block type", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Header,
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
        type: ElementType.Default,
        children: [
          {
            text: "fish",
          },
        ],
      },
      {
        type: ElementType.Default,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Header,
        children: [
          {
            text: "fish",
          },
        ],
      },
      {
        type: ElementType.Header,
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
        type: ElementType.Default,
        children: [
          {
            text: "This is a ",
          },
          {
            type: ElementType.Link,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Header,
        children: [
          {
            text: "This is a ",
          },
          {
            type: ElementType.Link,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "This is a ",
          },
          {
            type: ElementType.Link,
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
        type: ElementType.Header,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: ElementType.Default,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: ElementType.Default,
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
        type: ElementType.Default,
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

    toggleBlock(editor, ElementType.Header);

    expect(editor.children).toEqual([
      {
        type: ElementType.Header,
        children: [
          {
            text: "Header",
          },
        ],
      },
      {
        type: ElementType.Header,
        children: [
          {
            text: "Not Header",
          },
        ],
      },
    ]);
  });
});
