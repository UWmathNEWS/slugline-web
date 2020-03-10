import React, { useState } from "react";
import { Overlay, Form, Button } from "react-bootstrap";

interface LatexPopoverProps {
  target: React.Component | Element | Node;
  setLatex: (latex: string) => void;
  latex: string;
  show: boolean;
}

const LatexPopover: React.FC<LatexPopoverProps> = (
  props: LatexPopoverProps
) => {
  const [latex, setLatex] = useState<string>(props.latex);

  return (
    // these render props are untyped so let's hope we don't need them
    <Overlay target={props.target} show={props.show} placement="auto">
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
            <Form.Group controlId="latex">
              <Form.Label>LaTeX:</Form.Label>
              <Form.Control
                type="text"
                value={latex}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  setLatex(evt.currentTarget.value);
                }}
              />
            </Form.Group>
            <Button
              onClick={() => {
                props.setLatex(latex);
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

export default LatexPopover;
