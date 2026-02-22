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
      dx: (Math.random() - 0.5) * 6,
      dy: -4,
      radius: 8
    };

    // Paddles (vertical orientation - horizontal paddles)
    const playerPaddle: Paddle = {
      x: width / 2 - 50,
      y: height - 32,
      width: 100,
      height: 12
    };

    const aiPaddle: Paddle = {
      x: width / 2 - 50,
      y: 20,
      width: 100,
      height: 12
    };

    let playerScore = 0;
    let aiScore = 0;
    let animationId: number;
    let isTouching = false;
    let tiltX = 0;

    // Accelerometer setup
    const setupAccelerometer = () => {
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg?.Accelerometer) {
        tg.Accelerometer.start({ refresh_rate: 60 }, (data: any) => {
          if (data) {
            tiltX = Math.max(-1, Math.min(1, data.x * 2));
          }
        });
      } else if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (e) => {
          if (e.accelerationIncludingGravity) {
            const x = e.accelerationIncludingGravity.x || 0;
            tiltX = Math.max(-1, Math.min(1, x / 5));
          }
        });
      }
    };

    setupAccelerometer();

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isTouching = true;
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      playerPaddle.x = touchX - playerPaddle.width / 2;
      
      // Keep paddle in bounds
      if (playerPaddle.x < 0) playerPaddle.x = 0;
      if (playerPaddle.x + playerPaddle.width > width) {
        playerPaddle.x = width - playerPaddle.width;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isTouching) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        playerPaddle.x = touchX - playerPaddle.width / 2;
        
        // Keep paddle in bounds
        if (playerPaddle.x < 0) playerPaddle.x = 0;
        if (playerPaddle.x + playerPaddle.width > width) {
          playerPaddle.x = width - playerPaddle.width;
        }
      }
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      playerPaddle.x = mouseX - playerPaddle.width / 2;
      
      // Keep paddle in bounds
      if (playerPaddle.x < 0) playerPaddle.x = 0;
      if (playerPaddle.x + playerPaddle.width > width) {
        playerPaddle.x = width - playerPaddle.width;
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
      ctx.fillText(`${aiScore}`, width / 2, 60);
      ctx.fillText(`${playerScore}`, width / 2, height - 30);
    };

    const drawNet = () => {
      ctx.strokeStyle = themeColors.hint;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // AI movement
    const moveAI = () => {
      const aiCenter = aiPaddle.x + aiPaddle.width / 2;
      const aiSpeed = 3.5;

      if (ball.dy < 0) {
        // Ball moving towards AI
        if (aiCenter < ball.x - 10) {
          aiPaddle.x += aiSpeed;
        } else if (aiCenter > ball.x + 10) {
          aiPaddle.x -= aiSpeed;
        }
      } else {
        // Ball moving away, return to center
        const centerX = width / 2 - aiPaddle.width / 2;
        if (aiPaddle.x < centerX - 2) {
          aiPaddle.x += aiSpeed * 0.5;
        } else if (aiPaddle.x > centerX + 2) {
          aiPaddle.x -= aiSpeed * 0.5;
        }
      }

      // Keep AI paddle in bounds
      if (aiPaddle.x < 0) aiPaddle.x = 0;
      if (aiPaddle.x + aiPaddle.width > width) {
        aiPaddle.x = width - aiPaddle.width;
      }
    };

    // Player movement (accelerometer)
    const movePlayer = () => {
      if (!isTouching && tiltX !== 0) {
        playerPaddle.x += tiltX * 8;
        
        // Keep paddle in bounds
        if (playerPaddle.x < 0) playerPaddle.x = 0;
        if (playerPaddle.x + playerPaddle.width > width) {
          playerPaddle.x = width - playerPaddle.width;
        }
      }
    };

    // Ball physics
    const updateBall = () => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Left and right collision
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
        ball.dx = -ball.dx;
      }

      // Player paddle collision (bottom)
      if (
        ball.y + ball.radius > playerPaddle.y &&
        ball.x > playerPaddle.x &&
        ball.x < playerPaddle.x + playerPaddle.width &&
        ball.dy > 0
      ) {
        ball.dy = -ball.dy;
        const hitPos = (ball.x - (playerPaddle.x + playerPaddle.width / 2)) / (playerPaddle.width / 2);
        ball.dx = hitPos * 5;
      }

      // AI paddle collision (top)
      if (
        ball.y - ball.radius < aiPaddle.y + aiPaddle.height &&
        ball.x > aiPaddle.x &&
        ball.x < aiPaddle.x + aiPaddle.width &&
        ball.dy < 0
      ) {
        ball.dy = -ball.dy;
        const hitPos = (ball.x - (aiPaddle.x + aiPaddle.width / 2)) / (aiPaddle.width / 2);
        ball.dx = hitPos * 5;
      }

      // Score - AI wins if ball goes past bottom
      if (ball.y + ball.radius > height) {
        aiScore++;
        resetBall();
        if (aiScore >= 5) {
          setGameOver(true);
          cancelAnimationFrame(animationId);
        }
      }

      // Player wins if ball goes past top
      if (ball.y - ball.radius < 0) {
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
      ball.dx = (Math.random() - 0.5) * 6;
      ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4;
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
      movePlayer();
      
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
          Tilt device or touch/move mouse • First to 5 wins
        </div>
      </div>
    </div>
  );
}

export default PingPongGame;
