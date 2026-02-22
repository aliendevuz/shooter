import type { Player, Ball, Brick } from "./types";

export function createPlayer(): Player {
  return { x: 100, y: 450, width: 80, height: 20, speed: 5 };
}

export function createBall(): Ball {
  return { x: 120, y: 400, radius: 10, dx: 3, dy: -3 };
}

export function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 8; j++) {
      bricks.push({ x: j * 60 + 20, y: i * 30 + 50, width: 50, height: 20, destroyed: false });
    }
  }
  return bricks;
}
