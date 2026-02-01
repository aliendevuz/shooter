import { useEffect, useRef, useState } from "react";
import "./PingPongGame.css";

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function PingPongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [themeColors, setThemeColors] = useState({
    bg: "#0f0f1e",
    text: "#ffffff",
    hint: "#8e8e93",
    button: "#007aff",
    buttonText: "#ffffff"
  });

  useEffect(() => {
    // Get Telegram theme colors
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes?.();
      
      setThemeColors({
        bg: tg.backgroundColor || "#0f0f1e",
        text: tg.themeParams?.text_color || "#ffffff",
        hint: tg.themeParams?.hint_color || "#8e8e93",
        button: tg.themeParams?.button_color || "#007aff",
        buttonText: tg.themeParams?.button_text_color || "#ffffff"
      });

      // Apply theme to document
      document.body.style.backgroundColor = tg.backgroundColor || "#0f0f1e";
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Ball
    const ball: Ball = {
      x: width / 2,
      y: height / 2,
      dx: 4,
      dy: 4,
      radius: 8
    };

    // Paddles
    const playerPaddle: Paddle = {
      x: 20,
      y: height / 2 - 50,
      width: 12,
      height: 100
    };

    const aiPaddle: Paddle = {
      x: width - 32,
      y: height / 2 - 50,
      width: 12,
      height: 100
    };

    let playerScore = 0;
    let aiScore = 0;
    let animationId: number;
    let touchY = 0;
    let isTouching = false;

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isTouching = true;
      const rect = canvas.getBoundingClientRect();
      touchY = e.touches[0].clientY - rect.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isTouching) {
        const rect = canvas.getBoundingClientRect();
        touchY = e.touches[0].clientY - rect.top;
        playerPaddle.y = touchY - playerPaddle.height / 2;
        
        // Keep paddle in bounds
        if (playerPaddle.y < 0) playerPaddle.y = 0;
        if (playerPaddle.y + playerPaddle.height > height) {
          playerPaddle.y = height - playerPaddle.height;
        }
      }
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      playerPaddle.y = mouseY - playerPaddle.height / 2;
      
      // Keep paddle in bounds
      if (playerPaddle.y < 0) playerPaddle.y = 0;
      if (playerPaddle.y + playerPaddle.height > height) {
        playerPaddle.y = height - playerPaddle.height;
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Draw functions
    const drawBall = () => {
      ctx.fillStyle = themeColors.button;
      ctx.shadowBlur = 15;
      ctx.shadowColor = themeColors.button;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawPaddle = (paddle: Paddle) => {
      ctx.fillStyle = themeColors.text;
      ctx.shadowBlur = 10;
      ctx.shadowColor = themeColors.text;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.shadowBlur = 0;
    };

    const drawScore = () => {
      ctx.fillStyle = themeColors.hint;
      ctx.font = "32px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${playerScore}`, width / 4, 50);
      ctx.fillText(`${aiScore}`, (width * 3) / 4, 50);
    };

    const drawNet = () => {
      ctx.strokeStyle = themeColors.hint;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // AI movement
    const moveAI = () => {
      const aiCenter = aiPaddle.y + aiPaddle.height / 2;
      const aiSpeed = 3.5;

      if (ball.dx > 0) {
        // Ball moving towards AI
        if (aiCenter < ball.y - 10) {
          aiPaddle.y += aiSpeed;
        } else if (aiCenter > ball.y + 10) {
          aiPaddle.y -= aiSpeed;
        }
      } else {
        // Ball moving away, return to center
        const centerY = height / 2 - aiPaddle.height / 2;
        if (aiPaddle.y < centerY - 2) {
          aiPaddle.y += aiSpeed * 0.5;
        } else if (aiPaddle.y > centerY + 2) {
          aiPaddle.y -= aiSpeed * 0.5;
        }
      }

      // Keep AI paddle in bounds
      if (aiPaddle.y < 0) aiPaddle.y = 0;
      if (aiPaddle.y + aiPaddle.height > height) {
        aiPaddle.y = height - aiPaddle.height;
      }
    };

    // Ball physics
    const updateBall = () => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Top and bottom collision
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
        ball.dy = -ball.dy;
      }

      // Player paddle collision
      if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height &&
        ball.dx < 0
      ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy = hitPos * 5;
      }

      // AI paddle collision
      if (
        ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y &&
        ball.y < aiPaddle.y + aiPaddle.height &&
        ball.dx > 0
      ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (aiPaddle.y + aiPaddle.height / 2)) / (aiPaddle.height / 2);
        ball.dy = hitPos * 5;
      }

      // Score
      if (ball.x - ball.radius < 0) {
        aiScore++;
        resetBall();
        if (aiScore >= 5) {
          setGameOver(true);
          cancelAnimationFrame(animationId);
        }
      }

      if (ball.x + ball.radius > width) {
        playerScore++;
        resetBall();
        if (playerScore >= 5) {
          setGameOver(true);
          cancelAnimationFrame(animationId);
        }
      }

      setScore({ player: playerScore, ai: aiScore });
    };

    const resetBall = () => {
      ball.x = width / 2;
      ball.y = height / 2;
      ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
      ball.dy = (Math.random() - 0.5) * 6;
    };

    // Game loop
    const gameLoop = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawNet();
      drawBall();
      drawPaddle(playerPaddle);
      drawPaddle(aiPaddle);
      drawScore();
      
      updateBall();
      moveAI();
      
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [themeColors]);

  const handleRestart = () => {
    setScore({ player: 0, ai: 0 });
    setGameOver(false);
  };

  return (
    <div className="pingpong-game" style={{ backgroundColor: themeColors.bg }}>
      <div className="pingpong-container">
        <canvas 
          ref={canvasRef} 
          width={360} 
          height={640}
          className="pingpong-canvas"
        />
        
        {gameOver && (
          <div className="pingpong-gameover" style={{ backgroundColor: `${themeColors.bg}dd` }}>
            <div className="pingpong-gameover-content">
              <h1 style={{ color: themeColors.text }}>
                {score.player > score.ai ? "YOU WIN! 🎉" : "AI WINS!"}
              </h1>
              <p style={{ color: themeColors.hint }}>Final Score</p>
              <p style={{ color: themeColors.button }} className="pingpong-final-score">
                {score.player} : {score.ai}
              </p>
              <button 
                onClick={handleRestart}
                className="pingpong-restart-btn"
                style={{ 
                  backgroundColor: themeColors.button,
                  color: themeColors.buttonText
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
        
        <div className="pingpong-instructions" style={{ color: themeColors.hint }}>
          Touch or move mouse to control left paddle • First to 5 wins
        </div>
      </div>
    </div>
  );
}

export default PingPongGame;
