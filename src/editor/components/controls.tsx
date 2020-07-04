import React, { useRef, useState } from "react";
import { Mark, LinkElement, ElementType, InlineLatexElement } from "../types";
import { useSlate, ReactEditor } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  toggleMark,
  isMarkActive,
  createInline,
  increaseStress,
  increaseEmph,
} from "../helpers";

import "./styles/controls.scss";
import LinkPopover from "./LinkPopover";
import LatexPopover from "./LatexPopover";
import PopoverWrapper from "../../shared/PopoverWrapper";
import { faBold, faItalic } from "@fortawesome/free-solid-svg-icons";

export const IncreaseStressButton: React.FC = () => {
  const editor = useSlate();
  return (
    <button
      className="editor-control"
      onClick={() => {
        increaseStress(editor);
      }}
    >
      <FontAwesomeIcon icon={faBold} />
    </button>
  );
};

export const IncreaseEmphButton: React.FC = () => {
  const editor = useSlate();
  return (
    <button
      className="editor-control"
      onClick={() => {
        increaseEmph(editor);
      }}
    >
      <FontAwesomeIcon icon={faItalic} />
    </button>
  );
};

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
    const newLink: LinkElement = {
      type: ElementType.Link,
      href: href,
      children: [],
    };
    createInline(editor, newLink);
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
        <PopoverWrapper
          target={ref.current}
          show={showPopover}
          setShow={setShowPopover}
        >
          <LinkPopover href="" setHref={setHref} />
        </PopoverWrapper>
      )}
    </>
  );
};

export const InlineLatexButton: React.FC = () => {
  const editor = useSlate();
  const ref = useRef<HTMLButtonElement>(null);

  const [showPopover, setShowPopover] = useState<boolean>(false);

  const setLatex = (latex: string) => {
    ReactEditor.focus(editor);
    setShowPopover(false);
    const newLatex: InlineLatexElement = {
      type: ElementType.InlineLatex,
      latex: latex,
      children: [{ text: "" }],
    };
    createInline(editor, newLatex);
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
        <FontAwesomeIcon icon="dollar-sign" />
      </button>
      {ref.current && (
        <PopoverWrapper
          target={ref.current}
          show={showPopover}
          setShow={setShowPopover}
        >
          <LatexPopover latex="" setLatex={setLatex} />
        </PopoverWrapper>
      )}
    </>
  );
};
