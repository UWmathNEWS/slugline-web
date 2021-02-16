import React, { createContext, useState, useContext } from "react";
import { Dispatch, SetStateAction } from "react";

export interface ToastMessage {
  id: string;
  title?: string;
  body: string | React.ReactNode;
  delay?: number;
  _delay?: number;
  start?: number;
  show?: boolean;
}

export interface ToastManager {
  toasts: ToastMessage[];
  setToasts: Dispatch<SetStateAction<ToastMessage[]>>;
  setToastsHeuristically: (heuristic: number,
                           test: (msg: ToastMessage) => boolean,
                           action: (prevToasts: ToastMessage[], index: number) => void) => void;
  addToasts: (toasts: ToastMessage[]) => void;
}

const ToastManagerContext = createContext<ToastManager>({
  toasts: [],
  setToasts: () => {},
  setToastsHeuristically: () => {},
  addToasts: () => {}
});

export const ToastProvider: React.FC = props => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const setToastsHeuristically = (heuristic: number,
                                  test: (msg: ToastMessage) => boolean,
                                  action: (prevToasts: ToastMessage[], index: number) => void) => {
    setToasts((_prevToasts: ToastMessage[]) => {
      const prevToasts = _prevToasts.slice();
      // We can heuristically search only previous entries since the toasts list should only be pushed to
      for (let j = Math.min(heuristic, prevToasts.length - 1); j >= 0; --j) {
        if (test(prevToasts[j])) {
          action(prevToasts, j);
          return prevToasts;
        }
      }
      // if that doesn't work, perform the forwards search I guess
      for (let k = heuristic + 1; k < prevToasts.length; ++k) {
        if (test(prevToasts[k])) {
          action(prevToasts, k);
          return prevToasts;
        }
      }
      return _prevToasts;
    });
  };

  const addToasts = (toasts: ToastMessage[]) => setToasts(prevToasts =>
    prevToasts.map(t => {
      if (t.start !== undefined && t.delay !== undefined)
        t._delay = Math.max(t.start + t.delay - performance.now(), 0);
      return t;
    }).concat(toasts.map(t => {
      if (t.delay !== undefined) {
        t.start = performance.now();
        t._delay = t.delay;
      }
      return t;
    }).filter(t => t._delay === undefined || t._delay > 100))); // 150ms is the default bootstrap anim duration

  return (
    <ToastManagerContext.Provider value={{ toasts, setToasts, setToastsHeuristically, addToasts }}>
      {props.children}
    </ToastManagerContext.Provider>
  )
};

export const useToast = () => useContext(ToastManagerContext);
