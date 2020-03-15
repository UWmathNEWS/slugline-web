import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

interface LatexPopoverProps {
  setLatex: (latex: string) => void;
  latex: string;
}

const LatexPopover: React.FC<LatexPopoverProps> = (
  props: LatexPopoverProps
) => {
  const [latex, setLatex] = useState<string>(props.latex);

  return (
    <Form
      onSubmit={(evt: React.FormEvent) => {
        evt.preventDefault();
        props.setLatex(latex);
      }}
    >
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
      <Button type="submit">Done</Button>
    </Form>
  );
};

export default LatexPopover;
