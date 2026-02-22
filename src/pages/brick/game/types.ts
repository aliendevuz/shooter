export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export interface GameState {
  player: Player;
  ball: Ball;
  bricks: Brick[];
  score: number;
}
