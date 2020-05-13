import { useEffect, useRef, useCallback } from "react";

// taken from https://stackoverflow.com/questions/56283920/how-to-debounce-a-callback-in-functional-component-using-hooks
// with minor modifications
export const useDebouncedCallback = <A extends any[], R>(
  callback: (...args: A) => R | Promise<R>,
  wait: number
) => {
  // track args & timeout handle between calls
  const argsRef = useRef<A>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const cleanup = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, []);

  const callbackWithDebounce = useCallback(
    (...args: A) => {
      return new Promise<R>((resolve) => {
        // capture latest args
        argsRef.current = args;

        // clear debounce timer
        cleanup();

        // start waiting again
        timeout.current = setTimeout(() => {
          if (argsRef.current) {
            resolve(callback(...argsRef.current));
          }
        }, wait);
      });
    },
    [callback, wait]
  );

  const callbackWithoutDebounce = useCallback(
    (...args: A) => {
      cleanup();

      return callback(...args);
    },
    [callback]
  );

  return [callbackWithDebounce, callbackWithoutDebounce];
};
