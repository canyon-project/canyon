import "./index.css";
import "./useWorker.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root") as never).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
