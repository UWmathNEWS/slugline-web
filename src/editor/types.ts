import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

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

export type CustomText = {
  [MarkName in Mark]?: boolean;
} & {
  text: string;
};

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

export interface BaseInlineElement {
  type: InlineElementType;
  children: CustomText[];
}

export interface BaseInlineVoidElement {
  type: InlineElementType;
  children: [CustomText];
}

export interface LinkElement extends BaseInlineElement {
  type: InlineElementType.Link;
  href: string;
}

export interface InlineLatexElement extends BaseInlineVoidElement {
  type: InlineElementType.InlineLatex;
  latex: string;
}

export type InlineElement = LinkElement;
export type InlineVoidElement = InlineLatexElement;

export interface BaseBlockElement {
  type: BlockElementType;
  children: (SluglineElement | CustomText)[];
}

export interface BaseBlockVoidElement {
  type: BlockElementType;
  children: [CustomText];
}

export interface DefaultElement extends BaseBlockElement {
  type: BlockElementType.Default;
}

export interface Header1Element extends BaseBlockElement {
  type: BlockElementType.Header1;
}

export interface Header2Element extends BaseBlockElement {
  type: BlockElementType.Header2;
}

export interface CodeElement extends BaseBlockElement {
  type: BlockElementType.Code;
}

export interface UnorderedListElement extends BaseBlockElement {
  type: BlockElementType.UnorderedList;
}

export interface OrderedListElement extends BaseBlockElement {
  type: BlockElementType.OrderedList;
}

export interface ListItemElement extends BaseBlockElement {
  type: BlockElementType.ListItem;
}

export interface ImageElement extends BaseBlockVoidElement {
  type: BlockElementType.Image;
  src: string;
}

export interface ImageCaptionElement extends BaseBlockElement {
  type: BlockElementType.ImageCaption;
}

export interface VoidSpacerElement extends BaseBlockVoidElement {
  type: BlockElementType.VoidSpacer;
}

export type BlockElement =
  | DefaultElement
  | Header1Element
  | Header2Element
  | CodeElement
  | UnorderedListElement
  | OrderedListElement
  | ListItemElement
  | ImageCaptionElement;

export type BlockVoidElement = ImageElement | VoidSpacerElement;

export type SluglineElement =
  | InlineElement
  | InlineVoidElement
  | BlockElement
  | BlockVoidElement;

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module "slate" {
  interface CustomTypes {
    Element: SluglineElement;
    Text: CustomText;
    Editor: CustomEditor;
  }
}
