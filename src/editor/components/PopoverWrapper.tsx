import React from "react";
import { Overlay, OverlayProps } from "react-bootstrap";

interface PopoverProps extends OverlayProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

const PopoverWrapper: React.FC<PopoverProps> = (props) => {
  return (
    <Overlay
      target={props.target}
      show={props.show}
      placement="bottom-start"
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
