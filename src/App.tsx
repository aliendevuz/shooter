import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShooterGame from "./pages/ShooterGame";
import PingPongGame from "./pages/PingPongGame";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shooter" element={<ShooterGame />} />
        <Route path="/pingpong" element={<PingPongGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
