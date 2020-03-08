import React, { Ref, useState } from "react";
import { Overlay, Form, Button } from "react-bootstrap";

interface LinkPopoverProps {
  target: React.Component | Element | Node;
  setHref: (href: string) => void;
  href: string;
  show: boolean;
}

const LinkPopover: React.FC<LinkPopoverProps> = (props: LinkPopoverProps) => {
  const [input, setInput] = useState<string>(props.href);

  return (
    // these render props are untyped so let's hope we don't need them
    <Overlay target={props.target} show={props.show} placement="top">
      {({
        placement,
        scheduleUpdate,
        arrowProps,
        outOfBoundaries,
        show,
        ...overlayProps
      }: any) => {
        return (
          <div {...overlayProps} className="control-popover">
            <Form.Group controlId="linkHref">
              <Form.Label>Link target:</Form.Label>
              <Form.Control
                type="text"
                value={input}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  setInput(evt.currentTarget.value);
                }}
              />
            </Form.Group>
            <Button
              onClick={() => {
                props.setHref(input);
              }}
            >
              Done
            </Button>
          </div>
        );
      }}
    </Overlay>
  );
};

export default LinkPopover;
