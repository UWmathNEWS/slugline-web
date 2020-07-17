import React, { useRef, useState } from "react";
import {
  Mark,
  LinkElement,
  InlineLatexElement,
  BlockElementType,
  InlineElementType,
} from "../types";
import { useSlate, ReactEditor } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  toggleMark,
  isMarkActive,
  createInline,
  increaseStress,
  increaseEmph,
  toggleBlock,
  isBlockActive,
} from "../helpers";

import "./styles/controls.scss";
import LinkPopover from "./LinkPopover";
import LatexPopover from "./LatexPopover";
import PopoverWrapper from "./PopoverWrapper";
import { faBold, faItalic } from "@fortawesome/free-solid-svg-icons";
import { DropdownButton, Button } from "react-bootstrap";

export const ExtrasDropdown: React.FC = () => {
  return (
    <DropdownButton
      className="extras-dropdown"
      id="extrasDropdown"
      title="More"
      alignRight
      variant="link"
    >
      <ToggleMarkButtonText mark={Mark.ArticleRef} text="Article Reference" />
    </DropdownButton>
  );
};

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
  const className = active ? `editor-control active` : "editor-control";
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

interface ToggleMarkButtonTextProps {
  text: string;
  mark: Mark;
}

export const ToggleMarkButtonText: React.FC<ToggleMarkButtonTextProps> = (
  props: ToggleMarkButtonTextProps
) => {
  const editor = useSlate();
  return (
    <Button
      onClick={() => {
        toggleMark(editor, props.mark);
      }}
      variant="link"
    >
      {props.text}
    </Button>
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
      type: InlineElementType.Link,
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
      type: InlineElementType.InlineLatex,
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

interface ToggleBlockButtonProps {
  blockType: BlockElementType;
  icon: string;
}

export const ToggleBlockButton = (props: ToggleBlockButtonProps) => {
  const editor = useSlate();
  const active = isBlockActive(editor, props.blockType);
  const className = active ? "editor-control active" : "editor-control";
  return (
    <button
      className={className}
      onClick={() => {
        toggleBlock(editor, props.blockType);
      }}
    >
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </button>
  );
};
