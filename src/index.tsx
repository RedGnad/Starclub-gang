import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

if (process.env.NODE_ENV === "production") {
  const methods: Array<"log" | "debug" | "info" | "warn"> = [
    "log",
    "debug",
    "info",
    "warn",
  ];

  methods.forEach((method) => {
    console[method] = () => {};
  });
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
