import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

interface ImagePopoverProps {
  submit: (src: string, hasCaption: boolean) => void;
  src: string;
  hasCaption: boolean;
}

const ImagePopover: React.FC<ImagePopoverProps> = (props) => {
  const [src, setSrc] = useState<string>(props.src);
  const [hasCaption, setHasCaption] = useState<boolean>(props.hasCaption);

  return (
    <div className="control-popover">
      <Form
        onSubmit={(evt: React.FormEvent) => {
          evt.preventDefault();
          props.submit(src, hasCaption);
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
        <Form.Group controlId="imageCaptionCheck" className="mb-0">
          <Form.Check
            checked={hasCaption}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setHasCaption(evt.currentTarget.checked);
            }}
            className="mt-3"
            type="checkbox"
            label="Caption"
          />
        </Form.Group>
      </Form>
    </div>
  );
};

export default ImagePopover;
