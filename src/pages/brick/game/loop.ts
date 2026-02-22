import type { GameState } from "./types";
import { isKeyDown } from "./input";

export function update(state: GameState) {
  // Player harakati
  if (isKeyDown("ArrowLeft")) state.player.x -= state.player.speed;
  if (isKeyDown("ArrowRight")) state.player.x += state.player.speed;

  // Ball harakati
  state.ball.x += state.ball.dx;
  state.ball.y += state.ball.dy;

  // To‘qnashuvlarni tekshirish
  // Ball va devor
  if (state.ball.x < 0 || state.ball.x > 800) state.ball.dx *= -1;
  if (state.ball.y < 0) state.ball.dy *= -1;
}
