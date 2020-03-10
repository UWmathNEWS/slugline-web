import { Element } from "slate";

export enum Mark {
  Bold = "bold",
  Italic = "italic",
  Underline = "underline",
  Strikethrough = "strikethrough",
  Code = "code"
}

export enum ElementType {
  Default = "default",
  Link = "link",
  InlineLatex = "inline-latex"
}

export interface DefaultElement extends Element {
  type: ElementType.Default;
}

export interface LinkElement extends Element {
  type: ElementType.Link;
  href: string;
}

export interface InlineLatexElement extends Element {
  type: ElementType.InlineLatex;
  latex: string;
}

export type SluglineElement = DefaultElement | LinkElement | InlineLatexElement;
