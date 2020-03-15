import { ToastMessage, useToast } from "../contexts/ToastContext";
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
          toast.setToasts((_prevToasts: ToastMessage[]) => {
            const prevToasts = _prevToasts.slice();
            // We can heuristically search only previous entries since the toasts list should only be pushed to
            for (let j = Math.min(i, prevToasts.length - 1); j >= 0; --j) {
              if (prevToasts[j].id === msg.id) {
                prevToasts[j].show = false;
                return prevToasts;
              }
            }
            // if that doesn't work, perform the forwards search I guess
            for (let k = i + 1; k < prevToasts.length; ++k) {
              if (prevToasts[k].id === msg.id) {
                prevToasts[k].show = false;
                break;
              }
            }
            return prevToasts;
          });
          setTimeout(() => {
            // same as above
            toast.setToasts((_prevToasts: ToastMessage[]) => {
              const prevToasts = _prevToasts.slice();
              for (let j = Math.min(i, prevToasts.length - 1); j >= 0; --j) {
                if (prevToasts[j].id === msg.id) {
                  prevToasts.splice(j, 1);
                  return prevToasts;
                }
              }
              for (let k = i + 1; k < prevToasts.length; ++k) {
                if (prevToasts[k].id === msg.id) {
                  prevToasts.splice(k, 1);
                  break;
                }
              }
              return prevToasts;
            });
          }, 200);
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
