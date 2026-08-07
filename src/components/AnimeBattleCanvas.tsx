import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ShadowSlash {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  speed: number;
  width: number;
  color: string;
  glow: string;
  isDouble?: boolean;
}

interface MonarchEyeStreak {
  x: number;
  y: number;
  length: number;
  alpha: number;
  speedX: number;
  color: string;
}

export const AnimeBattleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Theme Aura particles (Burgundy Crimson to Oceanic Teal particles)
    const particles: Particle[] = [];
    const colors = ['#e11d48', '#f43f5e', '#22d3ee', '#14b8a6', '#028090', '#38bdf8', '#ffffff'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.8,
        speedY: -Math.random() * 2.5 - 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 120 + 60,
      });
    }

    // Shadow Dagger slashes
    const slashes: ShadowSlash[] = [];
    const spawnJinwooSlash = () => {
      if (slashes.length > 5) return;
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
      const length = Math.random() * 500 + 350;
      const startX = Math.random() * (width - 250);
      const startY = Math.random() * (height - 250);
      const isCrimson = Math.random() > 0.5;

      slashes.push({
        x1: startX,
        y1: startY,
        x2: startX + Math.cos(angle) * length,
        y2: startY + Math.sin(angle) * length,
        progress: 0,
        speed: Math.random() * 0.09 + 0.06,
        width: Math.random() * 4 + 2,
        color: isCrimson ? '#e11d48' : '#22d3ee',
        glow: isCrimson ? 'rgba(225, 29, 72, 0.8)' : 'rgba(34, 211, 238, 0.8)',
        isDouble: Math.random() > 0.5,
      });
    };

    // Monarch Eye Glow streaks (Jinwoo's glowing eyes in motion)
    const eyeStreaks: MonarchEyeStreak[] = [];
    const spawnEyeStreak = () => {
      if (eyeStreaks.length > 3) return;
      eyeStreaks.push({
        x: Math.random() * (width - 300),
        y: Math.random() * height,
        length: Math.random() * 180 + 100,
        alpha: 1,
        speedX: Math.random() * 15 + 10,
        color: Math.random() > 0.5 ? '#22d3ee' : '#e11d48',
      });
    };

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Randomly spawn Solo Leveling S2 Ep 11 Shadow Dagger Slashes & Eye Streaks
      if (frameCount % 60 === 0 || Math.random() < 0.025) {
        spawnJinwooSlash();
      }
      if (frameCount % 120 === 0 || Math.random() < 0.01) {
        spawnEyeStreak();
      }

      // Draw Monarch Eye Streaks
      for (let i = eyeStreaks.length - 1; i >= 0; i--) {
        const eye = eyeStreaks[i];
        eye.x += eye.speedX;
        eye.alpha -= 0.03;

        if (eye.alpha <= 0 || eye.x > width + 200) {
          eyeStreaks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(eye.x - eye.length, eye.y);
        ctx.strokeStyle = eye.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = eye.color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = eye.alpha;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Parallel second eye streak (dual glowing eyes)
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y + 12);
        ctx.lineTo(eye.x - eye.length * 0.85, eye.y + 12);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Dagger Slashes
      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i];
        s.progress += s.speed;

        if (s.progress >= 1) {
          slashes.splice(i, 1);
          continue;
        }

        const headX = s.x1 + (s.x2 - s.x1) * s.progress;
        const headY = s.y1 + (s.y2 - s.y1) * s.progress;

        const tailProgress = Math.max(0, s.progress - 0.38);
        const tailX = s.x1 + (s.x2 - s.x1) * tailProgress;
        const tailY = s.y1 + (s.y2 - s.y1) * tailProgress;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.shadowColor = s.glow;
        ctx.shadowBlur = 18;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (s.isDouble) {
          // Cross dagger slash offset
          ctx.beginPath();
          ctx.moveTo(tailX + 25, tailY - 25);
          ctx.lineTo(headX + 25, headY - 25);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = s.width * 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Floating Shadow Monarch Energy Embers
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        if (p.life > p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.speedY = -Math.random() * 2.5 - 0.8;
          p.life = 0;
          p.alpha = Math.random() * 0.8 + 0.2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // Solo Leveling Speed lines / Shadow dimension aura backdrop
      if (frameCount % 45 < 15) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
        ctx.lineWidth = 1.5;
        for (let l = 0; l < 4; l++) {
          const ly = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(0, ly);
          ctx.lineTo(width, ly + (Math.random() * 60 - 30));
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50 transition-opacity duration-1000"
    />
  );
};

