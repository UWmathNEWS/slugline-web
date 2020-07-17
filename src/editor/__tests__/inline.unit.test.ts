import {
  LinkElement,
  InlineLatexElement,
  BlockElementType,
  InlineElementType,
} from "../types";
import createCustomEditor from "../CustomEditor";
import { createInline } from "../helpers";

const TEST_LINK: LinkElement = {
  href: "www.test.com",
  type: InlineElementType.Link,
  children: [],
};

const TEST_LATEX_INLINE: InlineLatexElement = {
  latex: "\\LaTeX",
  type: InlineElementType.InlineLatex,
  children: [],
};

describe("createInline", () => {
  it("wraps single text nodes", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "voodoo",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    };
    createInline(editor, TEST_LINK, undefined);

    // Slate will not allow an inline node to be the first/last child,
    // so we need these empty text nodes before and after it
    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "",
          },
          {
            ...TEST_LINK,
            children: [
              {
                text: "voodoo",
              },
            ],
          },
          {
            text: "",
          },
        ],
      },
    ]);
  });

  it("wraps partial text nodes", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "voodoo",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 1,
      },
      focus: {
        path: [0, 0],
        offset: 4,
      },
    };
    createInline(editor, TEST_LINK, undefined);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "v",
          },
          {
            ...TEST_LINK,
            children: [
              {
                text: "ood",
              },
            ],
          },
          {
            text: "oo",
          },
        ],
      },
    ]);
  });

  it("overwrites text if provided", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "voodoo",
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    };

    createInline(editor, TEST_LINK, "overwritten");

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "",
          },
          {
            ...TEST_LINK,
            children: [
              {
                text: "overwritten",
              },
            ],
          },
          {
            text: "",
          },
        ],
      },
    ]);
  });

  it("does not create new inlines over existing ones", () => {
    const editor = createCustomEditor();
    const children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "hahaha",
          },
          {
            ...TEST_LINK,
            children: [
              {
                text: "voodoo",
              },
            ],
          },
          {
            text: "hehehe",
          },
        ],
      },
    ];
    editor.children = children;

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 2],
        offset: 6,
      },
    };

    createInline(editor, TEST_LINK, undefined);

    expect(editor.children).toEqual(children);
  });

  it("creates new inlines from collapsed ranges", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "hahaha",
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

    createInline(editor, TEST_LINK, "test-text");

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "",
          },
          {
            ...TEST_LINK,
            children: [
              {
                text: "test-text",
              },
            ],
          },
          {
            text: "hahaha",
          },
        ],
      },
    ]);
  });

  it("erases text when adding a void node", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "delete me",
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
        offset: 6,
      },
    };

    createInline(editor, TEST_LATEX_INLINE);

    expect(editor.children).toEqual([
      {
        type: BlockElementType.Default,
        children: [
          {
            text: "",
          },
          {
            ...TEST_LATEX_INLINE,
            children: [
              {
                text: "",
              },
            ],
          },
          {
            text: " me",
          },
        ],
      },
    ]);
  });
});
