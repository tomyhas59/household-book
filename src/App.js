import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Annual from "./pages/Annual";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/annual" element={<Annual />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
