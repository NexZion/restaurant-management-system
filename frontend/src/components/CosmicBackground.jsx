import { useEffect, useRef } from "react";

const CosmicBackground = ({ isDark }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const trailRef = useRef([]);

  // Add/remove dark class based on isDark prop
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    trailRef.current = [];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      for (let i = 0; i < 2; i++) {
        trailRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.5,
          life: 0,
          maxLife: Math.floor(Math.random() * 40 + 20),
          size: Math.random() * 2.5 + 0.8,
          type: Math.random() > 0.5 ? "star" : "dot",
          spin: Math.random() * Math.PI * 2,
        });
      }
      if (trailRef.current.length > 120) {
        trailRef.current = trailRef.current.slice(-120);
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    // Theme values for light and dark
    const theme = isDark
      ? {
          bg: "#18181B",
          starColor: "200,210,255",
          orbs: [
            { x: 0.5,  y: 0.3,  r: 320, color: "80,60,180",   alpha: 0.18, pulse: 0,   pSpeed: 0.008 },
            { x: 0.55, y: 0.25, r: 200, color: "120,40,200",  alpha: 0.12, pulse: 1,   pSpeed: 0.005 },
            { x: 0.45, y: 0.35, r: 180, color: "40,80,200",   alpha: 0.10, pulse: 2,   pSpeed: 0.006 },
            { x: 0.5,  y: 0.15, r: 140, color: "180,100,255", alpha: 0.08, pulse: 0.5, pSpeed: 0.007 },
          ],
          glows: [
            { x: 0.42, y: 0.46, r: 130, color: "120,60,255",  alpha: 0.22, pOff: 0.0 },
            { x: 0.58, y: 0.44, r: 110, color: "60,100,255",  alpha: 0.20, pOff: 1.2 },
            { x: 0.50, y: 0.56, r: 120, color: "160,50,240",  alpha: 0.18, pOff: 2.1 },
            { x: 0.44, y: 0.54, r: 100, color: "80,140,255",  alpha: 0.17, pOff: 0.7 },
            { x: 0.56, y: 0.52, r: 105, color: "100,60,220",  alpha: 0.19, pOff: 1.8 },
          ],
          coreColor: "160,120,255",
          coreAlpha: 0.12,
          streakColor: "200,180,255",
          cursorColor: "200,180,255",
          cursorGlow: "160,120,255",
        }
      : {
          bg: "#f3f4f6",
          starColor: "120,130,180",
          orbs: [
            { x: 0.5,  y: 0.3,  r: 320, color: "255,220,180",   alpha: 0.13, pulse: 0,   pSpeed: 0.008 },
            { x: 0.55, y: 0.25, r: 200, color: "255,240,200",  alpha: 0.09, pulse: 1,   pSpeed: 0.005 },
            { x: 0.45, y: 0.35, r: 180, color: "220,240,200",   alpha: 0.08, pulse: 2,   pSpeed: 0.006 },
            { x: 0.5,  y: 0.15, r: 140, color: "255,220,255", alpha: 0.06, pulse: 0.5, pSpeed: 0.007 },
          ],
          glows: [
            { x: 0.42, y: 0.46, r: 130, color: "255,220,255",  alpha: 0.12, pOff: 0.0 },
            { x: 0.58, y: 0.44, r: 110, color: "220,240,255",  alpha: 0.10, pOff: 1.2 },
            { x: 0.50, y: 0.56, r: 120, color: "255,220,255",  alpha: 0.09, pOff: 2.1 },
            { x: 0.44, y: 0.54, r: 100, color: "255,240,255",  alpha: 0.08, pOff: 0.7 },
            { x: 0.56, y: 0.52, r: 105, color: "255,220,220",  alpha: 0.10, pOff: 1.8 },
          ],
          coreColor: "255,220,255",
          coreAlpha: 0.09,
          streakColor: "120,130,180",
          cursorColor: "120,130,180",
          cursorGlow: "255,220,255",
        };

    // Stars
    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.005 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    // Shooting streaks
    const createStreak = () => {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 3 + 2;
      return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 0.6 - height * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 120 + 60,
        alpha: Math.random() * 0.5 + 0.1,
        life: Math.random() * 100,
        maxLife: Math.random() * 200 + 100,
        lineWidth: Math.random() * 1.5 + 0.5,
      };
    };
    const streaks = Array.from({ length: 18 }, createStreak);

    // 4-point star path helper
    const drawStarPath = (x, y, r, spikes, spin) => {
      const inner = r * 0.4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes + spin;
        const rad = i % 2 === 0 ? r : inner;
        i === 0
          ? ctx.moveTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad)
          : ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
      }
      ctx.closePath();
    };

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      // Nebula orbs
      theme.orbs.forEach((orb) => {
        const pulseScale = 1 + 0.06 * Math.sin(t * orb.pSpeed + orb.pulse);
        const ox = orb.x * width;
        const oy = orb.y * height;
        const or = orb.r * pulseScale;
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
        grd.addColorStop(0,   `rgba(${orb.color},${orb.alpha})`);
        grd.addColorStop(0.5, `rgba(${orb.color},${orb.alpha * 0.4})`);
        grd.addColorStop(1,   `rgba(${orb.color},0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, or, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Ambient glow clouds — centralized
      theme.glows.forEach((g) => {
        const pulse = 1 + 0.10 * Math.sin(t * 0.006 + g.pOff);
        const drift = Math.sin(t * 0.003 + g.pOff) * 8;
        const gx = g.x * width  + drift;
        const gy = g.y * height + drift * 0.5;
        const gr = g.r * pulse;

        // Outer haze
        const outer = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 1.6);
        outer.addColorStop(0,   `rgba(${g.color},${g.alpha * 0.5})`);
        outer.addColorStop(0.5, `rgba(${g.color},${g.alpha * 0.18})`);
        outer.addColorStop(1,   `rgba(${g.color},0)`);
        ctx.beginPath();
        ctx.arc(gx, gy, gr * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();

        // Bright inner core
        const inner = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 0.5);
        inner.addColorStop(0,   `rgba(${g.color},${g.alpha * 2.2})`);
        inner.addColorStop(0.6, `rgba(${g.color},${g.alpha * 0.9})`);
        inner.addColorStop(1,   `rgba(${g.color},0)`);
        ctx.beginPath();
        ctx.arc(gx, gy, gr * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = inner;
        ctx.fill();
      });

      // Central core glow
      const corePulse = theme.coreAlpha + 0.04 * Math.sin(t * 0.01);
      const coreGrd = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, 200);
      coreGrd.addColorStop(0,   `rgba(${theme.coreColor},${corePulse})`);
      coreGrd.addColorStop(0.4, `rgba(${theme.coreColor},${corePulse * 0.4})`);
      coreGrd.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, 200, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd;
      ctx.fill();

      // Stars
      stars.forEach((star) => {
        const flicker = 0.4 + 0.6 * Math.abs(Math.sin(t * star.speed + star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${theme.starColor},${star.alpha * flicker})`;
        ctx.fill();
      });

      // Shooting streaks
      streaks.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const progress = s.life / s.maxLife;
        const fadeAlpha = s.alpha * Math.sin(progress * Math.PI);
        const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (fadeAlpha > 0.005 && mag > 0) {
          const tailX = s.x - (s.vx / mag) * s.len;
          const tailY = s.y - (s.vy / mag) * s.len;
          const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          grad.addColorStop(0, `rgba(${theme.streakColor},${fadeAlpha})`);
          grad.addColorStop(1, `rgba(${theme.streakColor},0)`);
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = s.lineWidth;
          ctx.stroke();
        }
        if (s.life >= s.maxLife) streaks[i] = createStreak();
      });

      // Cursor trail sparkles
      const alive = [];
      for (const p of trailRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.spin += 0.06;
        p.life++;
        if (p.life >= p.maxLife) continue;
        alive.push(p);

        const progress = 1 - p.life / p.maxLife;
        const alpha = progress * 0.9;
        const size = p.size * progress;
        if (size < 0.1) continue;

        if (p.type === "star") {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${theme.cursorGlow},${alpha * 0.8})`;
          drawStarPath(p.x, p.y, size * 1.5, 4, p.spin);
          ctx.fillStyle = `rgba(${theme.cursorColor},${alpha})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${theme.cursorColor},${alpha * 0.6})`;
          ctx.fill();
        }
      }
      trailRef.current = alive;

      // Cursor glow + spinning star
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const cursorPulse = 0.5 + 0.5 * Math.sin(t * 0.08);
        const haloR = 28 + cursorPulse * 6;

        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, haloR);
        halo.addColorStop(0,   `rgba(${theme.cursorGlow},${0.18 * cursorPulse})`);
        halo.addColorStop(0.5, `rgba(${theme.cursorGlow},${0.08 * cursorPulse})`);
        halo.addColorStop(1,   `rgba(${theme.cursorGlow},0)`);
        ctx.beginPath();
        ctx.arc(mx, my, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${theme.cursorGlow},0.8)`;
        drawStarPath(mx, my, 5 + cursorPulse * 1.5, 4, t * 0.03);
        ctx.fillStyle = `rgba(${theme.cursorColor},0.95)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
      }

      t++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 block w-full h-full z-0 [cursor:none]"
    />
  );
};

export default CosmicBackground;