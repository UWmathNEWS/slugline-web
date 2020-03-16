import { useToast } from "../contexts/ToastContext";
import { Toast } from "react-bootstrap";
import React from "react";

const ToastContainer = () => {
  const toast = useToast();

  return (
    <div aria-live="polite" aria-atomic="true" style={{
      position: "fixed",
      right: 0,
      bottom: 0,
    }}>
      {toast.toasts.map((msg, i) => {
        const onClose = () => {
          toast.setToastsHeuristically(i, m => m.id === msg.id, (prevToasts, index) => {
            prevToasts[index].show = false;
          });
          setTimeout(() => {
            // same as above
            toast.setToastsHeuristically(i, m => m.id === msg.id, (prevToasts, index) => {
              prevToasts.splice(index, 1);
            });
          }, 500);
        };
        return (
          <Toast
            key={msg.id}
            onClose={onClose}
            onClick={onClose}
            show={msg.show ?? true}
            delay={msg._delay ?? 0}
            autohide={msg.delay !== undefined}>

            {msg.title && <Toast.Header>
              <strong className="mr-auto">{msg.title}</strong>
            </Toast.Header>}
            <Toast.Body>
              {msg.body}
            </Toast.Body>
          </Toast>
        );
      })}
    </div>
  );
};

export default ToastContainer;
