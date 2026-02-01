import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
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
      id: "runner",
      title: "Endless Runner",
      description: "Coming soon...",
      icon: "🏃",
      route: "#",
      status: "Coming Soon"
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
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">🎮 WebGames</h1>
        <p className="home-subtitle">Choose your game</p>
      </div>
      
      <div className="games-grid">
        {games.map((game) => (
          game.status === "Available" ? (
            <Link 
              key={game.id} 
              to={game.route} 
              className="game-card"
            >
              <div className="game-icon">{game.icon}</div>
              <h2 className="game-title">{game.title}</h2>
              <p className="game-description">{game.description}</p>
              <span className="game-status available">{game.status}</span>
            </Link>
          ) : (
            <div key={game.id} className="game-card disabled">
              <div className="game-icon">{game.icon}</div>
              <h2 className="game-title">{game.title}</h2>
              <p className="game-description">{game.description}</p>
              <span className="game-status coming-soon">{game.status}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default HomePage;
