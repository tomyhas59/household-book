import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Annual from "./pages/Annual";
import { RecoilRoot } from "recoil";
import Sign from "./pages/Sign";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Sign />} />
          <Route path="/main" element={<Main />} />
          <Route path="/annual" element={<Annual />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;
