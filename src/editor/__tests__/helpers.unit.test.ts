import { createInline, increaseStress, increaseEmph } from "../helpers";
import createCustomEditor from "../CustomEditor";
import { LinkElement, ElementType, InlineLatexElement, Mark } from "../types";

const TEST_LINK: LinkElement = {
  href: "www.test.com",
  type: ElementType.Link,
  children: [],
};

const TEST_LATEX_INLINE: InlineLatexElement = {
  latex: "\\LaTeX",
  type: ElementType.InlineLatex,
  children: [],
};

describe("createInline", () => {
  it("wraps single text nodes", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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
        type: ElementType.Default,
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

describe("increaseEmph", () => {
  it("increases emphasis", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
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
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 6,
      },
    };

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph1]: true,
          },
        ],
      },
    ]);

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph2]: true,
          },
        ],
      },
    ]);

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph3]: true,
          },
        ],
      },
    ]);

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph4]: true,
          },
        ],
      },
    ]);

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
          },
        ],
      },
    ]);
  });

  it("clears any stress", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Stress1]: true,
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

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph1]: true,
          },
        ],
      },
    ]);
  });

  it("formats based on first node selected", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph4]: true,
          },
          {
            text: "voodoo",
            [Mark.Emph1]: true,
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
        path: [0, 1],
        offset: 6,
      },
    };

    increaseEmph(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoovoodoo",
          },
        ],
      },
    ]);
  });
});

describe("increaseStress", () => {
  it("increases stress", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
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
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 6,
      },
    };

    increaseStress(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Stress1]: true,
          },
        ],
      },
    ]);

    increaseStress(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Stress2]: true,
          },
        ],
      },
    ]);

    increaseStress(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
          },
        ],
      },
    ]);
  });

  it("clears any emphasis", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Emph2]: true,
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

    increaseStress(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Stress1]: true,
          },
        ],
      },
    ]);
  });

  it("formats based on first node selected", () => {
    const editor = createCustomEditor();
    editor.children = [
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoo",
            [Mark.Stress2]: true,
          },
          {
            text: "voodoo",
            [Mark.Stress1]: true,
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
        path: [0, 1],
        offset: 6,
      },
    };

    increaseStress(editor);
    expect(editor.children).toEqual([
      {
        type: ElementType.Default,
        children: [
          {
            text: "voodoovoodoo",
          },
        ],
      },
    ]);
  });
});
