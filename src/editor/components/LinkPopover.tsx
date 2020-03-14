import React, { Ref, useState } from "react";
import { Form, Button } from "react-bootstrap";

interface LinkPopoverProps {
  setHref: (href: string) => void;
  href: string;
}

const LinkPopover: React.FC<LinkPopoverProps> = (props: LinkPopoverProps) => {
  const [input, setInput] = useState<string>(props.href);

  return (
    <div className="control-popover">
      <Form
        onSubmit={(evt: React.FormEvent) => {
          evt.preventDefault();
          props.setHref(input);
        }}
      >
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
        <Button type="submit">Done</Button>
      </Form>
    </div>
  );
};

export default LinkPopover;
