import { Element } from "slate";

export enum Mark {
  Emph1 = "emph-1",
  Emph2 = "emph-2",
  Emph3 = "emph-3",
  Emph4 = "emph-4",
  Stress1 = "stress-1",
  Stress2 = "stress-2",
  Strikethrough = "strikethrough",
  Code = "code",
}

export enum ElementType {
  Default = "default",
  Link = "link",
  InlineLatex = "inline-latex",
  Header = "header",
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

export type InlineElement = LinkElement;
export type InlineVoidElement = InlineLatexElement;

export interface HeaderElement extends Element {
  type: ElementType.Header;
}

export type BlockElement = HeaderElement;

export type SluglineElement =
  | DefaultElement
  | InlineElement
  | InlineVoidElement
  | BlockElement;
