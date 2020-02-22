import { EditorState, RichUtils } from "draft-js";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import "./EditorControls.scss";
import { InlineStyles } from "./types";

interface ToggleInlineStyleControlProps {
  style: InlineStyles;
  icon: string;
  state: EditorState;
  setState: (state: EditorState) => void;
}

const ToggleInlineStyleControl: React.FC<ToggleInlineStyleControlProps> = (
  props: ToggleInlineStyleControlProps
) => {
  const className = props.state.getCurrentInlineStyle().contains(props.style)
    ? "editor-control-icon active"
    : "editor-control-icon";
  return (
    <button
      className={className}
      onMouseDown={(evt: React.SyntheticEvent) => {
        evt.preventDefault();
        props.setState(RichUtils.toggleInlineStyle(props.state, props.style));
      }}
    >
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </button>
  );
};

export interface EditorControlProps {
  state: EditorState;
  setState: (state: EditorState) => void;
}

export const BoldControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleInlineStyleControl
      icon="bold"
      style={InlineStyles.Bold}
      {...props}
    />
  );
};

export const ItalicControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleInlineStyleControl
      icon="italic"
      style={InlineStyles.Italic}
      {...props}
    />
  );
};

export const UnderlineControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleInlineStyleControl
      icon="underline"
      style={InlineStyles.Underline}
      {...props}
    />
  );
};

export const StrikethroughControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleInlineStyleControl
      icon="strikethrough"
      style={InlineStyles.Strikethrough}
      {...props}
    />
  );
};

export const CodeControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleInlineStyleControl
      icon="code"
      style={InlineStyles.Code}
      {...props}
    />
  );
};
