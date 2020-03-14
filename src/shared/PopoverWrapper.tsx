import React from "react";
import { Overlay } from "react-bootstrap";

interface PopoverProps {
  target: React.Component | Element | Node;
  show: boolean;
  setShow: (show: boolean) => void;
}

const PopoverWrapper: React.FC<PopoverProps> = props => {
  return (
    <Overlay
      target={props.target}
      show={props.show}
      placement="auto"
      rootClose
      onHide={() => {
        props.setShow(false);
      }}
    >
      {({
        placement,
        scheduleUpdate,
        arrowProps,
        outOfBoundaries,
        show,
        ...overlayProps
      }: any) => {
        return <div {...overlayProps}>{props.children}</div>;
      }}
    </Overlay>
  );
};

export default PopoverWrapper;
