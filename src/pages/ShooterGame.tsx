import { useEffect, useState } from "react";
import { startGame, restartGame } from "../game";
import { debugInfo, tilt } from "../game/input";
import "./ShooterGame.css";

function ShooterGame() {
  const [showGyroPrompt, setShowGyroPrompt] = useState(false);
  const [showDebug, setShowDebug] = useState(true); // Debug mode default on
  const [debugData, setDebugData] = useState(debugInfo);
  const [themeColors, setThemeColors] = useState({
    bg: "#0f0f1e",
    text: "#ffffff",
    button: "#00ff41"
  });

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes?.();
      
      const bgColor = tg.backgroundColor || "#0f0f1e";
      setThemeColors({
        bg: bgColor,
        text: tg.themeParams?.text_color || "#ffffff",
        button: tg.themeParams?.button_color || "#00ff41"
      });
      
      document.body.style.backgroundColor = bgColor;
      
      console.log("Telegram WebApp initialized:", {
        platform: tg.platform,
        version: tg.version,
        initData: tg.initData
      });
    }
    
    // Check if iOS and needs permission (non-Telegram environment)
    if (!tg && 
        typeof DeviceOrientationEvent !== "undefined" && 
        typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      setShowGyroPrompt(true);
    } else {
      startGame();
    }
    
    // Debug data update loop
    const debugInterval = setInterval(() => {
      setDebugData({...debugInfo});
    }, 100);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const gameOverEl = document.getElementById("game-over");
        if (gameOverEl && gameOverEl.style.display === "flex") {
          restartGame();
        }
      }
      
      // Toggle debug with 'D' key
      if (e.key === "d" || e.key === "D") {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(debugInterval);
    };
  }, []);

  const handleStartWithGyro = () => {
    setShowGyroPrompt(false);
    startGame();
  };

  const handleRestartClick = () => {
    restartGame();
  };

  const handleDebugClick = () => {
    setShowDebug(false);
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
      
      <div className="game-area" style={{ backgroundColor: themeColors.bg }}>
        <div id="player" className="player" />
        <div id="score" className="score-display" style={{ color: themeColors.button }}>Score: 0</div>
        
        {/* Debug Panel */}
        {showDebug && (
          <div className="debug-panel" onClick={handleDebugClick}>
            <div className="debug-header">
              🔧 DEBUG MODE <span className="debug-hint">(Click to hide)</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Platform:</span>
              <span className={debugData.telegramSDK ? "debug-value-success" : "debug-value-warning"}>
                {debugData.platform}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Telegram SDK:</span>
              <span className={debugData.telegramSDK ? "debug-value-success" : "debug-value-error"}>
                {debugData.telegramSDK ? "✅ Active" : "❌ Not Available"}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Gyroscope:</span>
              <span className={tilt.enabled ? "debug-value-success" : "debug-value-warning"}>
                {debugData.gyroscopeStatus}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Tilt X:</span>
              <span className="debug-value">{tilt.x.toFixed(3)}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Tilt Y:</span>
              <span className="debug-value">{tilt.y.toFixed(3)}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Raw Gyro:</span>
              <span className="debug-value-small">
                X: {debugData.rawGyro.x.toFixed(2)} | 
                Y: {debugData.rawGyro.y.toFixed(2)} | 
                Z: {debugData.rawGyro.z.toFixed(2)}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Last Update:</span>
              <span className="debug-value-small">
                {debugData.lastGyroUpdate > 0 ? 
                  `${Date.now() - debugData.lastGyroUpdate}ms ago` : 
                  "Never"}
              </span>
            </div>
          </div>
        )}
        
        <div id="game-over" className="game-over-dialog">
          <div className="game-over-content">
            <h1>GAME OVER</h1>
            <p className="final-score-label">Final Score</p>
            <p id="final-score" className="final-score">0</p>
            <p className="restart-hint" onClick={handleRestartClick}>
              Tap to restart
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShooterGame;
