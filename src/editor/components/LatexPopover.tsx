import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";

interface LatexPopoverProps {
  setLatex: (latex: string) => void;
  latex: string;
}

const LatexPopover: React.FC<LatexPopoverProps> = (
  props: LatexPopoverProps
) => {
  const [latex, setLatex] = useState<string>(props.latex);

  return (
    <div className="control-popover">
      <Form
        onSubmit={(evt: React.FormEvent) => {
          evt.preventDefault();
          props.setLatex(latex);
        }}
      >
        <InputGroup>
          <Form.Control
            type="text"
            value={latex}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setLatex(evt.currentTarget.value);
            }}
            placeholder="LaTeX"
          />
          <InputGroup.Append>
            <Button type="submit">Done</Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    </div>
  );
};

export default LatexPopover;
