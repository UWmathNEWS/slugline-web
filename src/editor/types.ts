import { Element } from "slate";

export enum Mark {
  Emph1 = "emph-1",
  Emph2 = "emph-2",
  Emph3 = "emph-3",
  Emph4 = "emph-4",
  Stress1 = "stress-1",
  Stress2 = "stress-2",
  Strikethrough = "strikethrough",
  ArticleRef = "article-ref",
}

export enum InlineElementType {
  Link = "link",
  InlineLatex = "inline-latex",
}

export enum BlockElementType {
  Default = "paragraph",
  Header1 = "header-1",
  Header2 = "header-2",
  Code = "code",
  UnorderedList = "unordered-list",
  OrderedList = "ordered-list",
  ListItem = "list-item",
  Image = "image",
  ImageCaption = "image-caption",
  VoidSpacer = "void-spacer",
}

export type ListElementType =
  | BlockElementType.OrderedList
  | BlockElementType.UnorderedList;

export type ElementType = InlineElementType | BlockElementType;

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

export interface Header1Element extends Element {
  type: BlockElementType.Header1;
}

export interface Header2Element extends Element {
  type: BlockElementType.Header2;
}

export interface CodeElement extends Element {
  type: BlockElementType.Code;
}

export interface UnorderedListElement extends Element {
  type: BlockElementType.UnorderedList;
}

export interface OrderedListElement extends Element {
  type: BlockElementType.OrderedList;
}

export interface ListItemElement extends Element {
  type: BlockElementType.ListItem;
}

export interface ImageElement extends Element {
  type: BlockElementType.Image;
  src: string;
}

export interface ImageCaptionElement extends Element {
  type: BlockElementType.ImageCaption;
}

export interface VoidSpacerElement extends Element {
  type: BlockElementType.VoidSpacer;
}

export type BlockElement =
  | Header1Element
  | Header2Element
  | CodeElement
  | UnorderedListElement
  | OrderedListElement
  | ListItemElement
  | ImageCaptionElement
  | VoidSpacerElement;

export type BlockVoidElement = ImageElement;

export type SluglineElement =
  | DefaultElement
  | InlineElement
  | InlineVoidElement
  | BlockElement
  | BlockVoidElement;
