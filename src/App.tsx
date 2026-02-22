import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ShooterGame from "./pages/ShooterGame";
import BrickPage from "./pages/brick/BrickPage";
import PingPongGame from "./pages/PingPongGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shooter" element={<ShooterGame />} />
        <Route path="/pingpong" element={<PingPongGame />} />
        <Route path="/brick" element={<BrickPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
