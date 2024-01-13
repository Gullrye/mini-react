import React from "./core/react.js";
import ReactDOM from "./core/react-dom.js";

const textEl = React.createElement("ELEMENT_TEXT", { nodeValue: "mini react" });
const divEl = React.createElement("div", { className: "row" }, "ok!");
const App = React.createElement(
  "div",
  { id: "app" },
  "Good Evening! ",
  textEl,
  divEl
);
ReactDOM.createRoot(document.querySelector("#root")).render(App);
