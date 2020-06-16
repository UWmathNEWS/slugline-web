import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// TypeScript complains that `hot` doesn't exist on module.
// Rather than installing a types package, we choose to ignore it, since it's literally only here
// that TypeScript complains.
// @ts-ignore
const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate;

const render = (Component: React.ComponentType) =>
  renderMethod(<Component />, document.getElementById("root"));

render(App);

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept("./App", () => {
    const NextApp = require("./App").default;
    render(NextApp);
  })
}
