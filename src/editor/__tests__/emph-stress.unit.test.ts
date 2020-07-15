import createCustomEditor from "../CustomEditor";
import { ElementType, Mark } from "../types";
import { increaseEmph, increaseStress } from "../helpers";

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
