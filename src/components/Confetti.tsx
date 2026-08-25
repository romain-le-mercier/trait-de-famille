"use client";

import { useEffect, useRef } from "react";

const CRAYONS = [
  "#ff4b5c",
  "#ff9f1c",
  "#ffd23f",
  "#34c77b",
  "#3aa0ff",
  "#7b61ff",
  "#ff5fa2",
];

interface Crayon {
  x: number;
  y: number;
  vy: number;
  vx: number;
  angle: number;
  spin: number;
  length: number;
  width: number;
  color: string;
}

/** Confettis « crayons » de l'écran de succès. Respecte prefers-reduced-motion. */
export function Confetti({ duration = 4200 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = width < 640 ? 42 : 80;
    const pieces: Crayon[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: -Math.random() * height,
      vy: 1.4 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 1.1,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.09,
      length: 14 + Math.random() * 16,
      width: 4 + Math.random() * 3,
      color: CRAYONS[Math.floor(Math.random() * CRAYONS.length)],
    }));

    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const elapsed = now - start;
      const fade = Math.max(0, 1 - Math.max(0, elapsed - duration * 0.6) / (duration * 0.4));
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;

      for (const piece of pieces) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.angle += piece.spin;
        if (piece.y > height + 40) {
          piece.y = -30;
          piece.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.angle);
        // corps du crayon
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.width / 2, -piece.length / 2, piece.width, piece.length * 0.78);
        // pointe
        ctx.beginPath();
        ctx.moveTo(-piece.width / 2, piece.length * 0.28);
        ctx.lineTo(piece.width / 2, piece.length * 0.28);
        ctx.lineTo(0, piece.length / 2);
        ctx.closePath();
        ctx.fillStyle = "#f6e2c8";
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      if (elapsed < duration) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
