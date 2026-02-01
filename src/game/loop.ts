import type { Player, Enemy, Projectile, GameState } from "./types";
import { keys, tilt } from "./input";

export function updatePlayer(player: Player) {
  // Keyboard controls
  if (keys["ArrowUp"]) player.pos.y -= player.speed;
  if (keys["ArrowDown"]) player.pos.y += player.speed;
  if (keys["ArrowLeft"]) player.pos.x -= player.speed;
  if (keys["ArrowRight"]) player.pos.x += player.speed;
  
  // Gyroscope controls (mobile)
  if (tilt.enabled) {
    player.pos.x += tilt.x * player.speed * 1.2;
    player.pos.y += tilt.y * player.speed * 1.2;
  }
}

export function updateEnemies(enemies: Enemy[], gameWidth: number, gameHeight: number) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.pos.y += enemy.speed;
    
    if (enemy.pos.y > gameHeight) {
      enemies.splice(i, 1);
    }
  }
}

export function updateProjectiles(projectiles: Projectile[], gameWidth: number, gameHeight: number) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.pos.x += proj.vel.x;
    proj.pos.y += proj.vel.y;
    
    if (proj.pos.y < 0 || proj.pos.x < 0 || proj.pos.x > gameWidth) {
      projectiles.splice(i, 1);
    }
  }
}

export function checkCollisions(gameState: GameState): number {
  let kills = 0;
  
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const enemy = gameState.enemies[i];
    
    for (let j = gameState.projectiles.length - 1; j >= 0; j--) {
      const proj = gameState.projectiles[j];
      
      const dx = enemy.pos.x - proj.pos.x;
      const dy = enemy.pos.y - proj.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < enemy.size + proj.size) {
        gameState.enemies.splice(i, 1);
        gameState.projectiles.splice(j, 1);
        kills++;
        break;
      }
    }
  }
  
  // Player collision with enemies
  for (const enemy of gameState.enemies) {
    const dx = gameState.player.pos.x - enemy.pos.x;
    const dy = gameState.player.pos.y - enemy.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < gameState.player.size + enemy.size) {
      gameState.gameOver = true;
    }
  }
  
  return kills;
}

export function renderPlayer(el: HTMLElement, player: Player) {
  el.style.transform = `translate(${player.pos.x}px, ${player.pos.y}px)`;
}

export function renderEnemies(container: HTMLElement, enemies: Enemy[]) {
  const existingEnemies = container.querySelectorAll(".enemy");
  
  existingEnemies.forEach(el => el.remove());
  
  enemies.forEach((enemy, index) => {
    const el = document.createElement("div");
    el.className = "enemy";
    el.style.left = enemy.pos.x + "px";
    el.style.top = enemy.pos.y + "px";
    container.appendChild(el);
  });
}

export function renderProjectiles(container: HTMLElement, projectiles: Projectile[]) {
  const existingProj = container.querySelectorAll(".projectile");
  
  existingProj.forEach(el => el.remove());
  
  projectiles.forEach((proj) => {
    const el = document.createElement("div");
    el.className = "projectile";
    el.style.left = proj.pos.x + "px";
    el.style.top = proj.pos.y + "px";
    container.appendChild(el);
  });
}
