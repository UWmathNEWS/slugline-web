import "@testing-library/jest-dom/extend-expect";

// https://stackoverflow.com/a/32911774
const localStorageMock = (function() {
  let store: { [key: string]: string} = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: any) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    }
  }
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });
