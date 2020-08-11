import React, { useRef, useState, PropsWithChildren } from "react";
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
  toggleBlock,
  isBlockActive,
  hasInlines,
  unwrapInline,
} from "../helpers";

import "./styles/controls.scss";
import LinkPopover from "./LinkPopover";
import LatexPopover from "./LatexPopover";
import PopoverWrapper from "./PopoverWrapper";
import { DropdownButton, Button, Dropdown, ButtonGroup } from "react-bootstrap";

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

interface EditorDropdownProps {
  rootButton: React.ReactNode;
  id: string;
}

export const EditorDropdown: React.FC<EditorDropdownProps> = (
  props: PropsWithChildren<EditorDropdownProps>
) => {
  return (
    <Dropdown as={ButtonGroup}>
      {props.rootButton}
      <Dropdown.Toggle
        className="editor-control dropdown-toggle"
        split
        variant="link"
        id={props.id}
      />
      <Dropdown.Menu alignRight>{props.children}</Dropdown.Menu>
    </Dropdown>
  );
};

interface ToggleMarkButtonProps {
  icon: string;
  title: string;
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
      title={props.title}
      onClick={() => {
        ReactEditor.focus(editor);
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
  const active = isMarkActive(editor, props.mark);
  return (
    <Button
      className="editor-control-text"
      onClick={() => {
        ReactEditor.focus(editor);
        toggleMark(editor, props.mark);
      }}
      variant="link"
    >
      {active ? (
        <span className="underline-custom">{props.text}</span>
      ) : (
        props.text
      )}
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

  const active = hasInlines(editor, InlineElementType.Link);
  const className = active ? "editor-control active" : "editor-control";

  return (
    <>
      <button
        ref={ref}
        className={className}
        title="Link"
        onClick={() => {
          if (active) {
            ReactEditor.focus(editor);
            unwrapInline(editor, InlineElementType.Link);
          } else {
            setShowPopover(true);
          }
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
        title="Inline Latex"
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
  title: string;
  icon: string;
}

export const ToggleBlockButton = (props: ToggleBlockButtonProps) => {
  const editor = useSlate();
  const active = isBlockActive(editor, props.blockType);
  const className = active ? "editor-control active" : "editor-control";
  return (
    <button
      className={className}
      title={props.title}
      onClick={() => {
        ReactEditor.focus(editor);
        toggleBlock(editor, props.blockType);
      }}
    >
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </button>
  );
};

interface ToggleBlockButtonTextProps {
  text: string;
  block: BlockElementType;
}

export const ToggleBlockButtonText: React.FC<ToggleBlockButtonTextProps> = (
  props: ToggleBlockButtonTextProps
) => {
  const editor = useSlate();
  const active = isBlockActive(editor, props.block);
  return (
    <Button
      className="editor-control-text"
      onClick={() => {
        ReactEditor.focus(editor);
        toggleBlock(editor, props.block);
      }}
      variant="link"
    >
      {active ? (
        <span className="underline-custom">{props.text}</span>
      ) : (
        props.text
      )}
    </Button>
  );
};
