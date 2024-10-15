import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root") as HTMLDivElement | null;
const root = rootElement ? ReactDOM.createRoot(rootElement) : null;

if (root) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
