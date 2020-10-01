import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

interface ImagePopoverProps {
  submit: (src: string) => void;
  src: string;
}

const ImagePopover: React.FC<ImagePopoverProps> = (props) => {
  const [src, setSrc] = useState<string>(props.src);

  return (
    <div className="control-popover">
      <Form
        onSubmit={(evt: React.FormEvent) => {
          evt.preventDefault();
          props.submit(src);
        }}
      >
        <InputGroup>
          <Form.Control
            type="text"
            value={src}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setSrc(evt.currentTarget.value);
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

export default ImagePopover;
