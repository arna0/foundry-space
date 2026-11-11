import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  alpha: number;
  decay: number;
}

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const stars: Star[] = [];
    const colors = [
      'rgba(240, 246, 255,', // crisp white
      'rgba(215, 235, 255,', // icy blue
      'rgba(255, 244, 215,', // warm stellar ivory
      'rgba(180, 220, 255,', // celestial cyan
    ];

    const initStars = () => {
      stars.length = 0;
      const count = Math.min(220, Math.floor((width * height) / 8000));
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.35,
          baseAlpha: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          phase: Math.random() * Math.PI * 2,
          color,
        });
      }
    };

    initStars();

    const shootingStars: ShootingStar[] = [];
    let lastShootTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Periodically spawn a gentle shooting star
      const now = Date.now();
      if (now - lastShootTime > 5500 && Math.random() < 0.35) {
        lastShootTime = now;
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          dx: Math.random() * 5 + 6,
          dy: Math.random() * 3 + 2.5,
          length: Math.random() * 80 + 40,
          alpha: 0.85,
          decay: Math.random() * 0.015 + 0.012,
        });
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const tailX = s.x - (s.dx / Math.hypot(s.dx, s.dy)) * s.length;
        const tailY = s.y - (s.dy / Math.hypot(s.dx, s.dy)) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(0.3, `rgba(186, 230, 253, ${s.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(186, 230, 253, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        s.x += s.dx;
        s.y += s.dy;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      // Draw constellation interactive lines when mouse hovers nearby
      if (mouse.active) {
        const maxDist = 130;
        const nearby: Star[] = [];

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
          if (dist < maxDist) {
            nearby.push(s);
            const lineAlpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
          }
        }

        // Connect nearby stars with each other to form celestial asterisms
        for (let i = 0; i < nearby.length; i++) {
          for (let j = i + 1; j < nearby.length; j++) {
            const d = Math.hypot(nearby[i].x - nearby[j].x, nearby[i].y - nearby[j].y);
            if (d < 85) {
              const alpha = (1 - d / 85) * 0.25;
              ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(nearby[i].x, nearby[i].y);
              ctx.lineTo(nearby[j].x, nearby[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw all stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        const currentAlpha = Math.max(
          0.1,
          Math.min(0.95, s.baseAlpha + Math.sin(s.phase) * 0.3)
        );

        ctx.fillStyle = `${s.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle 4-point diffraction cross on the brightest stars
        if (s.radius > 1.2 && currentAlpha > 0.6) {
          ctx.strokeStyle = `${s.color}${currentAlpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - 4, s.y);
          ctx.lineTo(s.x + 4, s.y);
          ctx.moveTo(s.x, s.y - 4);
          ctx.lineTo(s.x, s.y + 4);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-65"
      aria-hidden="true"
    />
  );
};
