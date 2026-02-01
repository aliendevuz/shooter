import type { Player, GameState } from "./types";
import { updatePlayer, updateEnemies, updateProjectiles, checkCollisions, renderPlayer, renderEnemies, renderProjectiles } from "./loop";
import { keys, shootRequested, resetShootRequest, enableGyroscope } from "./input";

let gameState: GameState;
let gameContainer: HTMLElement;
let playerEl: HTMLElement;
let animationId: number;

function initGame() {
  gameContainer = document.querySelector(".game-area") as HTMLElement;
  playerEl = document.getElementById("player") as HTMLElement;
  
  const gameWidth = gameContainer.offsetWidth;
  const gameHeight = gameContainer.offsetHeight;

  gameState = {
    player: {
      pos: { x: gameWidth / 2 - 25, y: gameHeight - 80 },
      speed: 5,
      size: 50
    },
    enemies: [],
    projectiles: [],
    score: 0,
    gameOver: false
  };

  let lastShot = 0;
  let spawnCounter = 0;

  function gameLoop() {
    if (gameState.gameOver) {
      const gameOverEl = document.getElementById("game-over");
      const finalScoreEl = document.getElementById("final-score");
      if (gameOverEl) gameOverEl.style.display = "flex";
      if (finalScoreEl) finalScoreEl.textContent = gameState.score.toString();
      return;
    }

    // Update
    updatePlayer(gameState.player);
    
    // Boundary check
    if (gameState.player.pos.x < 0) gameState.player.pos.x = 0;
    if (gameState.player.pos.x + 50 > gameWidth) gameState.player.pos.x = gameWidth - 50;
    if (gameState.player.pos.y < 0) gameState.player.pos.y = 0;
    if (gameState.player.pos.y + 50 > gameHeight) gameState.player.pos.y = gameHeight - 50;
    
    updateEnemies(gameState.enemies, gameWidth, gameHeight);
    updateProjectiles(gameState.projectiles, gameWidth, gameHeight);
    
    const kills = checkCollisions(gameState);
    gameState.score += kills * 10;
    
    // Spawn enemies
    spawnCounter++;
    if (spawnCounter > 60) {
      gameState.enemies.push({
        pos: { x: Math.random() * (gameWidth - 40), y: -40 },
        size: 20,
        speed: 2 + Math.random() * 2
      });
      spawnCounter = 0;
    }
    
    // Shoot (Keyboard or Touch)
    if (keys[" "] || shootRequested) {
      const now = Date.now();
      if (now - lastShot > 150) {
        gameState.projectiles.push({
          pos: { x: gameState.player.pos.x + 25 - 3, y: gameState.player.pos.y },
          vel: { x: 0, y: -8 },
          size: 5
        });
        lastShot = now;
        resetShootRequest();
      }
    }
    
    // Render
    renderPlayer(playerEl, gameState.player);
    renderEnemies(gameContainer, gameState.enemies);
    renderProjectiles(gameContainer, gameState.projectiles);
    
    // Update score
    const scoreEl = document.getElementById("score");
    if (scoreEl) {
      scoreEl.textContent = "Score: " + gameState.score.toString();
    }
    
    animationId = requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

export function startGame() {
  // Enable gyroscope for mobile devices
  enableGyroscope();
  initGame();
}

export function restartGame() {
  // Cancel previous animation frame
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Hide game over screen
  const gameOverEl = document.getElementById("game-over");
  if (gameOverEl) gameOverEl.style.display = "none";
  
  // Restart
  initGame();
}
