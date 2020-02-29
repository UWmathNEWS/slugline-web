import React from "react";
import { Mark } from "../types";
import { useSlate } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { toggleMark, isMarkActive } from "../helpers";

import "./controls.scss";

interface ToggleMarkButtonProps {
  icon: string;
  mark: Mark;
}

export const ToggleMarkButton: React.FC<ToggleMarkButtonProps> = (
  props: ToggleMarkButtonProps
) => {
  const editor = useSlate();
  const active = isMarkActive(editor, props.mark);
  const className = active ? "editor-control active" : "editor-control";
  return (
    <button
      className={className}
      onClick={() => {
        toggleMark(editor, props.mark);
      }}
    >
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </button>
  );
};
