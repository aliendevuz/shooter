import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./HomePage.css";

function HomePage() {
  const [themeColors, setThemeColors] = useState({
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cardBg: "#ffffff",
    text: "#333333",
    secondaryText: "#666666",
    button: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      const bgColor = tg.backgroundColor || "#ffffff";
      const textColor = tg.themeParams?.text_color || "#000000";
      const hintColor = tg.themeParams?.hint_color || "#999999";
      const buttonColor = tg.themeParams?.button_color || "#007aff";
      
      setThemeColors({
        bg: bgColor,
        cardBg: tg.themeParams?.bg_color || "#ffffff",
        text: textColor,
        secondaryText: hintColor,
        button: buttonColor
      });

      document.body.style.backgroundColor = bgColor;
    }
  }, []);

  const games = [
    {
      id: "shooter",
      title: "Space Shooter",
      description: "Tilt your device to dodge enemies and shoot them down!",
      icon: "🚀",
      route: "/shooter",
      status: "Available"
    },
    {
      id: "pingpong",
      title: "Ping Pong",
      description: "Classic paddle game. First to 5 wins!",
      icon: "🏓",
      route: "/pingpong",
      status: "Available"
    },
    {
      id: "brick",
      title: "Brick Game",
      description: "Classic Brick Game",
      icon: "🧱",
      route: "/brick",
      status: "Available"
    },
    {
      id: "puzzle",
      title: "Puzzle Challenge",
      description: "Coming soon...",
      icon: "🧩",
      route: "#",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="home-page" style={{ background: themeColors.bg }}>
      <div className="home-header">
        <h1 className="home-title" style={{ color: themeColors.text }}>🎮 WebGames</h1>
        <p className="home-subtitle" style={{ color: themeColors.secondaryText }}>Choose your game</p>
      </div>

      <div>
        <h2>Platformer Game:</h2>
        <a href="https://platformer-game-alien.netlify.app/">Bounce Taler</a>
      </div>
      
      <div className="games-grid">
        {games.map((game) => (
          game.status === "Available" ? (
            <Link 
              key={game.id} 
              to={game.route} 
              className="game-card"
              style={{ backgroundColor: themeColors.cardBg }}
            >
              <div className="game-icon">{game.icon}</div>
              <h2 className="game-title" style={{ color: themeColors.text }}>{game.title}</h2>
              <p className="game-description" style={{ color: themeColors.secondaryText }}>{game.description}</p>
              <span className="game-status available" style={{ background: themeColors.button, color: "#ffffff" }}>{game.status}</span>
            </Link>
          ) : (
            <div key={game.id} className="game-card disabled" style={{ backgroundColor: themeColors.cardBg }}>
              <div className="game-icon">{game.icon}</div>
              <h2 className="game-title" style={{ color: themeColors.text }}>{game.title}</h2>
              <p className="game-description" style={{ color: themeColors.secondaryText }}>{game.description}</p>
              <span className="game-status coming-soon">{game.status}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default HomePage;
