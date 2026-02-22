import { useRef, useEffect } from "react";
import gameLoop from "./game";

export default function BrickPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) gameLoop(canvasRef.current);
  }, []);

  return <canvas ref={canvasRef} width={800} height={500}></canvas>;
}
