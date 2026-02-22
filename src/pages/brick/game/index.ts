import { createPlayer, createBall, createBricks } from "./entities";
import { update } from "./loop";
import type { GameState } from "./types";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 500;
document.body.appendChild(canvas);

// const ctx = canvas.getContext("2d")!;
const state: GameState = {
  player: createPlayer(),
  ball: createBall(),
  bricks: createBricks(),
  score: 0
};

// function render() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Player chizish
//   ctx.fillStyle = "blue";
//   ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

//   // Ball chizish
//   ctx.beginPath();
//   ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
//   ctx.fillStyle = "red";
//   ctx.fill();

//   // Bricks chizish
//   ctx.fillStyle = "green";
//   state.bricks.forEach(brick => {
//     if (!brick.destroyed) ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
//   });
// }

export default function gameLoop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;

  function loop() {
    update(state);
    render();
    requestAnimationFrame(loop);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "blue";
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.fillStyle = "green";
    state.bricks.forEach(brick => {
      if (!brick.destroyed) ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });
  }

  loop(); // loopni ishga tushuradi
}
