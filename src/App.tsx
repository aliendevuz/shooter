import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShooterGame from "./pages/ShooterGame";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shooter" element={<ShooterGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
