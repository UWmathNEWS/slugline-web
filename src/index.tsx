import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const render = (Component: typeof App) =>
  ReactDOM.render(<Component />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

render(App);

// TypeScript complains that `hot` doesn't exist on module.
// Rather than installing a types package, we choose to ignore it, since it's literally only here
// that TypeScript complains.
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept("./App", () => {
    const NextApp = require("./App").default;
    render(NextApp);
  })
}