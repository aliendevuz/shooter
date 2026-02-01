import { useEffect, useState } from "react";
import { startGame, restartGame } from "./game";
import "./App.css";

function App() {
  const [showGyroPrompt, setShowGyroPrompt] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes?.();
      console.log("Telegram WebApp initialized");
    }
    
    // Check if iOS and needs permission (non-Telegram environment)
    if (!tg && 
        typeof DeviceOrientationEvent !== "undefined" && 
        typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      setShowGyroPrompt(true);
    } else {
      startGame();
    }
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const gameOverEl = document.getElementById("game-over");
        if (gameOverEl && gameOverEl.style.display === "flex") {
          restartGame();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleStartWithGyro = () => {
    setShowGyroPrompt(false);
    startGame();
  };

  return (
    <>
      {showGyroPrompt && (
        <div className="gyro-prompt">
          <div className="gyro-prompt-content">
            <h2>🎮 Enable Motion Controls?</h2>
            <p>Tilt your device to move the player</p>
            <button onClick={handleStartWithGyro} className="gyro-button">
              Start Game
            </button>
          </div>
        </div>
      )}
      
      <div className="game-area">
        <div id="player" className="player" />
        <div id="score" className="score-display">Score: 0</div>
        
        <div id="game-over" className="game-over-dialog">
          <div className="game-over-content">
            <h1>GAME OVER</h1>
            <p className="final-score-label">Final Score</p>
            <p id="final-score" className="final-score">0</p>
            <p className="restart-hint">Press ENTER to restart</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
