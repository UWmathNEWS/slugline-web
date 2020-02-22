import { EditorState, RichUtils } from "draft-js";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import "./EditorControls.scss";
import { InlineStyles } from "./types";

interface ToggleControlProps {
  active: boolean;
  icon: string;
  onClick: () => void;
}

const ToggleControl: React.FC<ToggleControlProps> = (
  props: ToggleControlProps
) => {
  const className = props.active
    ? "editor-control-icon active"
    : "editor-control-icon";
  return (
    <button
      className={className}
      onMouseDown={(evt: React.SyntheticEvent) => {
        evt.preventDefault();
        props.onClick();
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
    <ToggleControl
      icon="bold"
      active={props.state.getCurrentInlineStyle().contains(InlineStyles.Bold)}
      onClick={() => {
        props.setState(
          RichUtils.toggleInlineStyle(props.state, InlineStyles.Bold)
        );
      }}
    />
  );
};

export const ItalicControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleControl
      icon="italic"
      active={props.state.getCurrentInlineStyle().contains(InlineStyles.Italic)}
      onClick={() => {
        props.setState(
          RichUtils.toggleInlineStyle(props.state, InlineStyles.Italic)
        );
      }}
    />
  );
};

export const UnderlineControl: React.FC<EditorControlProps> = (
  props: EditorControlProps
) => {
  return (
    <ToggleControl
      icon="underline"
      active={props.state
        .getCurrentInlineStyle()
        .contains(InlineStyles.Underline)}
      onClick={() => {
        props.setState(
          RichUtils.toggleInlineStyle(props.state, InlineStyles.Underline)
        );
      }}
    />
  );
};
