
export type Vec2 = {
  x: number;
  y: number;
};

export type Player = {
  pos: Vec2;
  speed: number;
  size: number;
};
export type Enemy = {
  pos: Vec2;
  size: number;
  speed: number;
};

export type Projectile = {
  pos: Vec2;
  vel: Vec2;
  size: number;
};

export type GameState = {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  score: number;
  gameOver: boolean;
};