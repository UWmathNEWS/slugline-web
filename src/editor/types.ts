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
  ArticleRef = "article-ref",
}

export enum InlineElementType {
  Link = "link",
  InlineLatex = "inline-latex",
}

export enum BlockElementType {
  Default = "paragraph",
  Header = "header",
}

export interface DefaultElement extends Element {
  type: BlockElementType.Default;
}

export interface LinkElement extends Element {
  type: InlineElementType.Link;
  href: string;
}

export interface InlineLatexElement extends Element {
  type: InlineElementType.InlineLatex;
  latex: string;
}

export type InlineElement = LinkElement;
export type InlineVoidElement = InlineLatexElement;

export interface HeaderElement extends Element {
  type: BlockElementType.Header;
}

export type BlockElement = HeaderElement;

export type SluglineElement =
  | DefaultElement
  | InlineElement
  | InlineVoidElement
  | BlockElement;
