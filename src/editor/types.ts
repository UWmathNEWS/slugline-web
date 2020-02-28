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
  Link = "link"
}

export interface DefaultElement extends Element {
  type: ElementType.Default;
}

export interface LinkElement extends Element {
  type: ElementType.Link;
  href: string;
}

export type SluglineElement = DefaultElement | LinkElement;
