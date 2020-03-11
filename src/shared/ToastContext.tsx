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
  addToasts: (toast: ToastMessage[]) => void;
}

const ToastManager = createContext<ToastManager>({
  toasts: [],
  setToasts: (fcn: any) => {},
  addToasts: (toast) => {}
});

export const ToastProvider: React.FC = props => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToasts = (toast: ToastMessage[]) => setToasts(prevToasts =>
    prevToasts.map(t => {
      if (t.start !== undefined && t.delay !== undefined)
        t._delay = Math.max(t.start + t.delay - performance.now(), 0);
      return t;
    }).concat(toast.map(t => {
      if (t.delay !== undefined) {
        t.start = performance.now();
        t._delay = t.delay;
      }
      return t;
    }).filter(t => t._delay === undefined || t._delay > 100))); // 150ms is the default bootstrap anim duration

  return (
    <ToastManager.Provider value={{ toasts, setToasts, addToasts }}>
      {props.children}
    </ToastManager.Provider>
  )
};

export const useToast = () => useContext(ToastManager);
