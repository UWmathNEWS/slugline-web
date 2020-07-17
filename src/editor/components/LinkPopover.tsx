import React, { useState } from "react";
import { Form, Button, Col, InputGroup } from "react-bootstrap";

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
        <InputGroup>
          <Form.Control
            type="text"
            value={input}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setInput(evt.currentTarget.value);
            }}
            placeholder="URL"
          />
          <InputGroup.Append>
            <Button type="submit">Done</Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    </div>
  );
};

export default LinkPopover;
