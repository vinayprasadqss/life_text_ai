import React from "react";
import { BrowserRouter } from "react-router-dom";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/scss/index.scss";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(

      <BrowserRouter>
        <App />
      </BrowserRouter>

);
