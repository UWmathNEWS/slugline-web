import React, { useRef, useState } from "react";
import { Mark } from "../types";
import { useSlate, ReactEditor } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { toggleMark, isMarkActive, toggleLink } from "../helpers";

import "./controls.scss";
import LinkPopover from "./LinkPopover";

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

export const LinkButton: React.FC = () => {
  const editor = useSlate();
  const ref = useRef<HTMLButtonElement>(null);

  const [showPopover, setShowPopover] = useState<boolean>(false);

  const setHref = (href: string) => {
    ReactEditor.focus(editor);
    setShowPopover(false);
    toggleLink(editor, href);
  };

  return (
    <>
      <button
        ref={ref}
        className="editor-control"
        onClick={() => {
          setShowPopover(true);
        }}
      >
        <FontAwesomeIcon icon="link" />
      </button>
      {ref.current && (
        <LinkPopover
          target={ref.current}
          href=""
          show={showPopover}
          setHref={setHref}
        />
      )}
    </>
  );
};
