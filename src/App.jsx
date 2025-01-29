import React from "react";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import New from "./pages/New";

import { Routes, Route } from "react-router-dom";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<New />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
