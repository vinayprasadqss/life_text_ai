import React from "react";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import New from "./pages/New";

import { Routes, Route, Navigate } from "react-router-dom";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/index.html" element={<Home />} />
        <Route path="/new" element={<New />} />
        {/* Catch-all route: Redirect any unknown path to /index.html */}
        <Route path="*" element={<Navigate to="/index.html" replace />} />
      </Routes>
    </>
  );
};

export default App;
