import React, { useRef, useEffect } from "react";
import { WordTarget } from "../words";

export interface LaserBeam {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

interface GameCanvasProps {
  targets: WordTarget[];
  activeTargetId: string | null;
  lasers: LaserBeam[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  shake: number;
  isFreezeActive: boolean;
  empRadius: number; // 0 if none
  hullHealth: number; // 0 to 100
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  targets,
  activeTargetId,
  lasers,
  particles,
  floatingTexts,
  shake,
  isFreezeActive,
  empRadius,
  hullHealth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background stars
  const starsRef = useRef<{ x: number; y: number; s: number; speed: number; a: number }[]>([]);

  useEffect(() => {
    // Generate stars once
    const stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.0008 + 0.0003,
        a: Math.random() * 0.7 + 0.3,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();

      // Screen shake offset
      if (shake > 0.5) {
        const dx = (Math.random() - 0.5) * shake * 12;
        const dy = (Math.random() - 0.5) * shake * 12;
        ctx.translate(dx, dy);
      }

      // 1. Clear background with deep space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#030712");
      bgGrad.addColorStop(0.7, "#090d1a");
      bgGrad.addColorStop(1, "#0d1124");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Stars
      starsRef.current.forEach((st) => {
        st.y += st.speed;
        if (st.y > 1) st.y = 0;
        ctx.fillStyle = `rgba(190, 215, 255, ${st.a})`;
        ctx.beginPath();
        ctx.arc(st.x * width, st.y * height, st.s, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Cyber grid lines at the base (synthwave perspective)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 1;
      const horizonY = height * 0.75;
      for (let i = 0; i <= 10; i++) {
        const y = horizonY + Math.pow(i / 10, 2) * (height - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(width / 2 + i * (width / 10), height);
        ctx.stroke();
      }

      // 4. Defense perimeter barrier line
      const barrierY = height - 240;
      ctx.strokeStyle = hullHealth > 30 ? "rgba(6, 182, 212, 0.45)" : "rgba(239, 68, 68, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, barrierY);
      ctx.lineTo(width, barrierY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Player Turret at elevated base (clearly above virtual keyboard)
      const turretX = width / 2;
      const turretY = height - 210;

      // Find active target to swivel cannon towards
      const activeTarget = targets.find((t) => t.id === activeTargetId);
      let angle = -Math.PI / 2;
      if (activeTarget) {
        const tx = (activeTarget.x / 100) * width;
        const ty = (activeTarget.y / 100) * height;
        angle = Math.atan2(ty - turretY, tx - turretX);
      }

      // Armored Turret Base Platform
      ctx.fillStyle = "rgba(10, 16, 32, 0.95)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(turretX - 44, turretY + 6, 88, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Base Tread/Platform Accents
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(turretX - 38, turretY + 20, 76, 2);

      // Turret base glow
      const baseGrad = ctx.createRadialGradient(turretX, turretY, 5, turretX, turretY, 50);
      baseGrad.addColorStop(0, "rgba(99, 102, 241, 0.4)");
      baseGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(turretX, turretY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Turret cannon
      ctx.save();
      ctx.translate(turretX, turretY);
      ctx.rotate(angle);
      // Dual cannon barrels
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, -7, 32, 4);
      ctx.fillRect(0, 3, 32, 4);
      // Cannon mount
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Core light
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Laser Beams
      lasers.forEach((laser) => {
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 12;

        const curX = laser.startX + (laser.targetX - laser.startX) * laser.progress;
        const curY = laser.startY + (laser.targetY - laser.startY) * laser.progress;

        ctx.beginPath();
        ctx.moveTo(laser.startX, laser.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Tip spark
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. EMP Shockwave Expansion
      if (empRadius > 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
        ctx.lineWidth = 6;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, empRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
        ctx.fill();
        ctx.restore();
      }

      // 8. Word Targets
      targets.forEach((target) => {
        const x = (target.x / 100) * width;
        const y = (target.y / 100) * height;
        const isLocked = target.id === activeTargetId;

        ctx.save();
        ctx.translate(x, y);

        // Target pod body styling based on kind
        let podWidth = Math.max(target.word.length * 15 + 40, 90);
        let podHeight = 36;
        let podColor = "#1e293b";
        let borderColor = target.glowColor || "#38bdf8";

        if (target.kind === "scout") {
          borderColor = "#06b6d4";
        } else if (target.kind === "heavy") {
          borderColor = "#ec4899";
          podHeight = 40;
        } else if (target.kind === "emp") {
          borderColor = "#f59e0b";
        } else if (target.kind === "heal") {
          borderColor = "#10b981";
        } else if (target.kind === "freeze") {
          borderColor = "#67e8f9";
        }

        if (isLocked) {
          borderColor = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 18;
        }

        // Draw Pod Container with chamfered corners
        ctx.fillStyle = podColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isLocked ? 2.5 : 1.5;

        ctx.beginPath();
        const r = 8;
        const hw = podWidth / 2;
        const hh = podHeight / 2;
        ctx.roundRect(-hw, -hh, podWidth, podHeight, r);
        ctx.fill();
        ctx.stroke();

        // Icon indicator for specials
        if (target.kind === "emp") {
          ctx.font = "14px sans-serif";
          ctx.fillText("⚡", -hw + 8, 4);
        } else if (target.kind === "heal") {
          ctx.font = "14px sans-serif";
          ctx.fillText("💖", -hw + 8, 4);
        } else if (target.kind === "freeze") {
          ctx.font = "14px sans-serif";
          ctx.fillText("❄️", -hw + 8, 4);
        } else if (target.kind === "heavy") {
          ctx.font = "12px sans-serif";
          ctx.fillText("🛡️", -hw + 8, 4);
        }

        // Render Word Letters with dual-state highlighting
        ctx.font = "bold 17px 'JetBrains Mono', monospace";
        ctx.textBaseline = "middle";

        const textOffset =
          target.kind === "emp" || target.kind === "heal" || target.kind === "freeze" || target.kind === "heavy"
            ? 8
            : 0;

        const typedPart = target.word.slice(0, target.typedIndex);
        const nextChar = target.word[target.typedIndex] || "";
        const remainPart = target.word.slice(target.typedIndex + 1);

        const totalWordWidth = ctx.measureText(target.word).width;
        let startCharX = -totalWordWidth / 2 + textOffset;

        // 1. Typed letters (Glowing gold/cyan)
        if (typedPart) {
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = isLocked ? 10 : 4;
          ctx.fillText(typedPart, startCharX, 0);
          startCharX += ctx.measureText(typedPart).width;
        }

        // 2. Next Letter to hit (High-visibility white/cyan pulsing cursor)
        if (nextChar) {
          ctx.fillStyle = isLocked ? "#ffffff" : "#93c5fd";
          ctx.shadowColor = isLocked ? "#38bdf8" : "transparent";
          ctx.shadowBlur = isLocked ? 14 : 0;
          ctx.fillText(nextChar, startCharX, 0);

          if (isLocked) {
            // Draw underline cursor below active letter
            const charW = ctx.measureText(nextChar).width;
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(startCharX, 10, charW, 2.5);
          }
          startCharX += ctx.measureText(nextChar).width;
        }

        // 3. Remaining letters (Subtle slate)
        if (remainPart) {
          ctx.fillStyle = "#94a3b8";
          ctx.shadowBlur = 0;
          ctx.fillText(remainPart, startCharX, 0);
        }

        // If locked, draw lock brackets around pod
        if (isLocked) {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          const bracketSize = 7;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(-hw - 6, -hh + bracketSize);
          ctx.lineTo(-hw - 6, -hh - 6);
          ctx.lineTo(-hw + bracketSize, -hh - 6);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(hw + 6, -hh + bracketSize);
          ctx.lineTo(hw + 6, -hh - 6);
          ctx.lineTo(hw - bracketSize, -hh - 6);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(-hw - 6, hh - bracketSize);
          ctx.lineTo(-hw - 6, hh + 6);
          ctx.lineTo(-hw + bracketSize, hh + 6);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(hw + 6, hh - bracketSize);
          ctx.lineTo(hw + 6, hh + 6);
          ctx.lineTo(hw - bracketSize, hh + 6);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 9. Particles (Explosion fragments)
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 10. Floating Score Text Popups
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = "bold 15px 'Chakra Petch', sans-serif";
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 11. Freeze Screen Vignette
      if (isFreezeActive) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 14;
        ctx.strokeRect(0, 0, width, height);
      }

      ctx.restore();
    };

    render();
  }, [targets, activeTargetId, lasers, particles, floatingTexts, shake, isFreezeActive, empRadius, hullHealth]);

  // Keep canvas internal resolution matched to window client size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
    />
  );
};
