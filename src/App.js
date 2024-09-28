import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Annual from "./pages/Annual";
import { RecoilRoot } from "recoil";
import Sign from "./pages/Sign";

const App = () => {
  return (
    <RecoilRoot>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/main" element={<Main />} />
          <Route path="/annual" element={<Annual />} />
          <Route path="/" element={<Sign />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;
