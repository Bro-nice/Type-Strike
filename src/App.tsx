import React, { useState, useEffect, useRef, useCallback } from "react";
import { sound } from "./audio";
import { getRandomWord, WordTarget } from "./words";
import { GameCanvas, LaserBeam, Particle, FloatingText } from "./components/GameCanvas";
import { GameHUD } from "./components/GameHUD";
import { TitleScreen, PauseModal, GameOverModal, GameMode } from "./components/GameScreens";

const HIGH_SCORE_KEY = "typestrike_high_score";
const BEST_WPM_KEY = "typestrike_best_wpm";

export default function App() {
  // Game State Machine: "title" | "playing" | "paused" | "gameover"
  const [gameState, setGameState] = useState<"title" | "playing" | "paused" | "gameover">("title");
  const [gameMode, setGameMode] = useState<GameMode>("arcade");
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  // Stats
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [hullHealth, setHullHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [empCharge, setEmpCharge] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);

  // High Scores
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
    } catch {
      return 0;
    }
  });
  const [bestWpm, setBestWpm] = useState(() => {
    try {
      return parseInt(localStorage.getItem(BEST_WPM_KEY) || "0", 10);
    } catch {
      return 0;
    }
  });

  // Active targets & animation state
  const [targets, setTargets] = useState<WordTarget[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [lasers, setLasers] = useState<LaserBeam[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [shake, setShake] = useState(0);
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [empRadius, setEmpRadius] = useState(0);

  // Refs for 60fps game loop
  const targetsRef = useRef<WordTarget[]>([]);
  const activeTargetIdRef = useRef<string | null>(null);
  const lasersRef = useRef<LaserBeam[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shakeRef = useRef(0);
  const hullHealthRef = useRef(100);
  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const maxComboRef = useRef(1);
  const empChargeRef = useRef(0);
  const waveRef = useRef(1);
  const wordsDestroyedRef = useRef(0);
  const totalCorrectKeystrokes = useRef(0);
  const totalErrors = useRef(0);
  const gameStartTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const freezeTimerRef = useRef(0);
  const empShockwaveRef = useRef(0);

  // Keep refs in sync with state for rendering
  useEffect(() => {
    activeTargetIdRef.current = activeTargetId;
  }, [activeTargetId]);

  const toggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Start / Restart Game
  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setWpm(0);
    setAccuracy(100);
    setCombo(1);
    setMaxCombo(1);
    setHullHealth(100);
    setWave(1);
    setEmpCharge(0);
    setTimeLeft(mode === "time-attack" ? 60 : 0);
    setWordsDestroyed(0);

    scoreRef.current = 0;
    comboRef.current = 1;
    maxComboRef.current = 1;
    hullHealthRef.current = 100;
    waveRef.current = 1;
    empChargeRef.current = 0;
    wordsDestroyedRef.current = 0;
    totalCorrectKeystrokes.current = 0;
    totalErrors.current = 0;
    gameStartTime.current = performance.now();
    lastSpawnTime.current = performance.now();
    freezeTimerRef.current = 0;
    empShockwaveRef.current = 0;

    targetsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    activeTargetIdRef.current = null;

    setTargets([]);
    setActiveTargetId(null);
    setLasers([]);
    setParticles([]);
    setFloatingTexts([]);
    setGameState("playing");
  }, []);

  // Spawn word target
  const spawnTarget = useCallback(() => {
    const { word, kind, points } = getRandomWord(gameMode, waveRef.current);

    // Prevent immediate overlapping x coordinates
    let x = 12 + Math.random() * 76; // keep within 12% - 88%
    const currentTargets = targetsRef.current;
    if (currentTargets.length > 0) {
      const lastX = currentTargets[currentTargets.length - 1].x;
      if (Math.abs(lastX - x) < 14) {
        x = (x + 35) % 80 + 10;
      }
    }

    // Base speed scales gently with wave
    let baseSpeed = 2.4 + waveRef.current * 0.45;
    if (gameMode === "zen") baseSpeed = 2.2;
    if (kind === "scout") baseSpeed *= 1.45;
    if (kind === "heavy") baseSpeed *= 0.65;

    let glowColor = "#38bdf8";
    if (kind === "scout") glowColor = "#06b6d4";
    if (kind === "heavy") glowColor = "#ec4899";
    if (kind === "emp") glowColor = "#f59e0b";
    if (kind === "heal") glowColor = "#10b981";
    if (kind === "freeze") glowColor = "#67e8f9";

    const newTarget: WordTarget = {
      id: `target-${Date.now()}-${Math.random()}`,
      word,
      typedIndex: 0,
      x,
      y: 8,
      speed: baseSpeed,
      kind,
      points,
      glowColor,
      spawnTime: performance.now(),
    };

    targetsRef.current.push(newTarget);
    setTargets([...targetsRef.current]);
  }, [gameMode]);

  // Trigger EMP screen blast
  const triggerEMP = useCallback(() => {
    if (empChargeRef.current < 100 && targetsRef.current.length === 0) return;
    sound.playEMP();
    empShockwaveRef.current = 10;
    empChargeRef.current = 0;
    setEmpCharge(0);
    shakeRef.current = 1.8;

    // Destroy all hostiles on screen!
    const destroyedCount = targetsRef.current.length;
    let addedScore = 0;

    targetsRef.current.forEach((t) => {
      addedScore += t.points * comboRef.current;
      // Spawn particles
      spawnParticles((t.x / 100) * window.innerWidth, (t.y / 100) * window.innerHeight, t.glowColor, 20);
    });

    scoreRef.current += addedScore;
    wordsDestroyedRef.current += destroyedCount;
    targetsRef.current = [];
    activeTargetIdRef.current = null;

    setScore(scoreRef.current);
    setWordsDestroyed(wordsDestroyedRef.current);
    setTargets([]);
    setActiveTargetId(null);

    // Floating text
    floatingTextsRef.current.push({
      id: `ft-emp-${Date.now()}`,
      text: `⚡ EMP BLAST! +${addedScore}`,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: "#f59e0b",
      alpha: 1,
      scale: 1.5,
    });
  }, []);

  // Spawn particle explosion
  const spawnParticles = (x: number, y: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.4 + 0.3,
        color,
        size: Math.random() * 3.5 + 1.5,
      });
    }
  };

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Pause with Esc
      if (e.key === "Escape") {
        if (gameState === "playing") {
          setGameState("paused");
        } else if (gameState === "paused") {
          setGameState("playing");
        }
        return;
      }

      // Title or Game Over screen controls
      if (gameState === "title" || gameState === "gameover") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startGame(gameMode);
        }
        if (e.key === "m" || e.key === "M") {
          toggleMute();
        }
        return;
      }

      if (gameState !== "playing") return;

      // In-game EMP Blast activation
      if ((e.key === " " || e.key === "Enter") && empChargeRef.current >= 100) {
        e.preventDefault();
        triggerEMP();
        return;
      }

      // Filter typing keys
      const char = e.key.toLowerCase();
      if (char.length !== 1) return;

      // Sound click
      sound.playKeyClick(char);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const turretX = width / 2;
      const turretY = height - 210;

      let currentActiveId = activeTargetIdRef.current;
      let activeTarget = targetsRef.current.find((t) => t.id === currentActiveId);

      // If no active target locked, find candidate starting with this char
      if (!activeTarget) {
        const candidates = targetsRef.current.filter(
          (t) => t.word[0].toLowerCase() === char
        );
        if (candidates.length > 0) {
          // Lock target closest to base (highest y)
          candidates.sort((a, b) => b.y - a.y);
          activeTarget = candidates[0];
          currentActiveId = activeTarget.id;
          activeTargetIdRef.current = currentActiveId;
          setActiveTargetId(currentActiveId);
        } else {
          // Missed keystroke
          sound.playError();
          totalErrors.current += 1;
          comboRef.current = 1;
          setCombo(1);
          return;
        }
      }

      // Check typed character against target
      const expectedChar = activeTarget.word[activeTarget.typedIndex]?.toLowerCase();

      if (char === expectedChar) {
        // Correct Hit!
        totalCorrectKeystrokes.current += 1;
        activeTarget.typedIndex += 1;

        // Laser beam animation
        const targetX = (activeTarget.x / 100) * width;
        const targetY = (activeTarget.y / 100) * height;

        lasersRef.current.push({
          startX: turretX,
          startY: turretY,
          targetX,
          targetY,
          progress: 0,
          color: comboRef.current >= 20 ? "#f59e0b" : "#38bdf8",
        });

        sound.playLaserShot();

        // Increment combo
        comboRef.current += 1;
        if (comboRef.current > maxComboRef.current) {
          maxComboRef.current = comboRef.current;
          setMaxCombo(comboRef.current);
        }
        setCombo(comboRef.current);

        // Check if Word is Complete
        if (activeTarget.typedIndex >= activeTarget.word.length) {
          // Word Destroyed!
          const earned = activeTarget.points * comboRef.current;
          scoreRef.current += earned;
          wordsDestroyedRef.current += 1;
          setScore(scoreRef.current);
          setWordsDestroyed(wordsDestroyedRef.current);

          // Explosion sound & particles
          sound.playExplosion(comboRef.current);
          spawnParticles(targetX, targetY, activeTarget.glowColor, 28);
          shakeRef.current = Math.min(shakeRef.current + 0.6, 1.5);

          // EMP charge increment
          empChargeRef.current = Math.min(100, empChargeRef.current + 12);
          setEmpCharge(empChargeRef.current);

          // Handle special target powers
          if (activeTarget.kind === "heal") {
            sound.playPowerup();
            hullHealthRef.current = Math.min(100, hullHealthRef.current + 25);
            setHullHealth(hullHealthRef.current);
            floatingTextsRef.current.push({
              id: `ft-heal-${Date.now()}`,
              text: "💖 +25% SHIELD REPAIRED",
              x: targetX,
              y: targetY - 20,
              color: "#10b981",
              alpha: 1,
              scale: 1.2,
            });
          } else if (activeTarget.kind === "freeze") {
            sound.playPowerup();
            freezeTimerRef.current = 6;
            setIsFreezeActive(true);
            floatingTextsRef.current.push({
              id: `ft-freeze-${Date.now()}`,
              text: "❄️ TIME FREEZE 6s",
              x: targetX,
              y: targetY - 20,
              color: "#38bdf8",
              alpha: 1,
              scale: 1.2,
            });
          } else if (activeTarget.kind === "emp") {
            triggerEMP();
          }

          // Floating score text
          floatingTextsRef.current.push({
            id: `ft-${Date.now()}`,
            text: `+${earned}`,
            x: targetX,
            y: targetY,
            color: activeTarget.glowColor,
            alpha: 1,
            scale: comboRef.current > 10 ? 1.4 : 1,
          });

          // Wave progression
          if (wordsDestroyedRef.current % 12 === 0) {
            waveRef.current += 1;
            setWave(waveRef.current);
            sound.playWaveClear();
            floatingTextsRef.current.push({
              id: `ft-wave-${Date.now()}`,
              text: `⚔️ WAVE ${waveRef.current} INCOMING!`,
              x: width / 2,
              y: height * 0.35,
              color: "#818cf8",
              alpha: 1,
              scale: 1.6,
            });
          }

          // Remove target & reset active
          targetsRef.current = targetsRef.current.filter((t) => t.id !== activeTarget!.id);
          activeTargetIdRef.current = null;
          setActiveTargetId(null);
        }

        setTargets([...targetsRef.current]);
      } else {
        // Typing error on active target
        sound.playError();
        totalErrors.current += 1;
        comboRef.current = 1;
        setCombo(1);
        shakeRef.current = 0.4;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, gameMode, triggerEMP, startGame]);

  // Main 60fps Game Simulation Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastTime = performance.now();
    let animId: number;

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // clamp delta time
      lastTime = currentTime;

      // 1. Calculate live WPM & Accuracy
      const elapsedMinutes = (currentTime - gameStartTime.current) / 60000;
      if (elapsedMinutes > 0.02) {
        const currentWpm = Math.max(0, Math.round((totalCorrectKeystrokes.current / 5) / elapsedMinutes));
        setWpm(currentWpm);
        const totalKeys = totalCorrectKeystrokes.current + totalErrors.current;
        const currentAcc = totalKeys > 0 ? Math.round((totalCorrectKeystrokes.current / totalKeys) * 100) : 100;
        setAccuracy(currentAcc);
      }

      // 2. Time-attack mode timer countdown
      if (gameMode === "time-attack") {
        const remaining = Math.max(0, 60 - Math.floor((currentTime - gameStartTime.current) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          endGame(true);
          return;
        }
      }

      // 3. Freeze timer countdown
      if (freezeTimerRef.current > 0) {
        freezeTimerRef.current -= dt;
        if (freezeTimerRef.current <= 0) {
          setIsFreezeActive(false);
        }
      }

      // 4. EMP shockwave expansion
      if (empShockwaveRef.current > 0) {
        empShockwaveRef.current += dt * 1400;
        setEmpRadius(empShockwaveRef.current);
        if (empShockwaveRef.current > Math.max(window.innerWidth, window.innerHeight)) {
          empShockwaveRef.current = 0;
          setEmpRadius(0);
        }
      }

      // 5. Screen shake decay
      if (shakeRef.current > 0.02) {
        shakeRef.current *= 0.9;
        setShake(shakeRef.current);
      } else {
        setShake(0);
      }

      // 6. Spawn targets cadence
      const spawnInterval = Math.max(1200, 3200 - waveRef.current * 250);
      const isUnderTargetCap = targetsRef.current.length < 3 + waveRef.current;
      if (currentTime - lastSpawnTime.current > spawnInterval && isUnderTargetCap) {
        spawnTarget();
        lastSpawnTime.current = currentTime;
      }

      // 7. Move targets down towards base
      const speedMultiplier = freezeTimerRef.current > 0 ? 0.35 : 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const remainingTargets: WordTarget[] = [];
      let baseTookDamage = false;

      for (let i = 0; i < targetsRef.current.length; i++) {
        const target = targetsRef.current[i];
        target.y += target.speed * dt * speedMultiplier;

        // Check if crossed defense perimeter barrier (84% height)
        if (target.y >= 84) {
          // Breach!
          if (gameMode !== "zen") {
            const damage = target.kind === "heavy" ? 22 : 12;
            hullHealthRef.current = Math.max(0, hullHealthRef.current - damage);
            setHullHealth(hullHealthRef.current);
            baseTookDamage = true;
          }

          // Screen shake & particles
          sound.playDamage();
          shakeRef.current = 2.0;
          spawnParticles((target.x / 100) * width, (target.y / 100) * height, "#ef4444", 25);

          // If active target breached, reset active lock
          if (activeTargetIdRef.current === target.id) {
            activeTargetIdRef.current = null;
            setActiveTargetId(null);
          }
        } else {
          remainingTargets.push(target);
        }
      }

      targetsRef.current = remainingTargets;
      setTargets([...remainingTargets]);

      // Check Game Over condition
      if (hullHealthRef.current <= 0 && gameMode !== "zen") {
        endGame(false);
        return;
      }

      // 8. Update laser beams
      const nextLasers: LaserBeam[] = [];
      for (const laser of lasersRef.current) {
        laser.progress += dt * 8; // fast laser speed
        if (laser.progress < 1) {
          nextLasers.push(laser);
        }
      }
      lasersRef.current = nextLasers;
      setLasers(nextLasers);

      // 9. Update particles
      const nextParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life > 0) {
          nextParticles.push(p);
        }
      }
      particlesRef.current = nextParticles;
      setParticles(nextParticles);

      // 10. Update floating texts
      const nextFloating: FloatingText[] = [];
      for (const ft of floatingTextsRef.current) {
        ft.y -= dt * 40;
        ft.alpha -= dt * 0.9;
        if (ft.alpha > 0) {
          nextFloating.push(ft);
        }
      }
      floatingTextsRef.current = nextFloating;
      setFloatingTexts(nextFloating);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, gameMode, spawnTarget]);

  // End Game & Record High Scores
  const endGame = (isVictory: boolean = false) => {
    setGameState("gameover");

    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
      } catch {}
    }

    const elapsedMinutes = (performance.now() - gameStartTime.current) / 60000;
    const finalWpm = elapsedMinutes > 0.05 ? Math.round((totalCorrectKeystrokes.current / 5) / elapsedMinutes) : 0;
    if (finalWpm > bestWpm) {
      setBestWpm(finalWpm);
      try {
        localStorage.setItem(BEST_WPM_KEY, finalWpm.toString());
      } catch {}
    }
  };

  const activeTarget = targets.find((t) => t.id === activeTargetId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 60fps Isolated Simulation Canvas */}
      <GameCanvas
        targets={targets}
        activeTargetId={activeTargetId}
        lasers={lasers}
        particles={particles}
        floatingTexts={floatingTexts}
        shake={shake}
        isFreezeActive={isFreezeActive}
        empRadius={empRadius}
        hullHealth={hullHealth}
      />

      {/* World-Matched Low-Occlusion HUD Overlay (when playing or paused) */}
      {(gameState === "playing" || gameState === "paused") && (
        <GameHUD
          score={score}
          wpm={wpm}
          accuracy={accuracy}
          combo={combo}
          hullHealth={hullHealth}
          wave={wave}
          empCharge={empCharge}
          timeLeft={timeLeft}
          gameMode={gameMode}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onPause={() => setGameState("paused")}
          activeWord={activeTarget?.word}
          typedChars={activeTarget?.typedIndex}
        />
      )}

      {/* Game Shell Screens */}
      {gameState === "title" && (
        <TitleScreen
          onStart={startGame}
          selectedMode={gameMode}
          onSelectMode={setGameMode}
          highScore={highScore}
          bestWpm={bestWpm}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {gameState === "paused" && (
        <PauseModal
          onResume={() => setGameState("playing")}
          onRestart={() => startGame(gameMode)}
          onExit={() => setGameState("title")}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {gameState === "gameover" && (
        <GameOverModal
          score={score}
          wpm={wpm}
          accuracy={accuracy}
          totalKeystrokes={totalCorrectKeystrokes.current + totalErrors.current}
          wordsDestroyed={wordsDestroyed}
          maxCombo={maxCombo}
          wave={wave}
          isVictory={gameMode === "time-attack" && timeLeft <= 0}
          onRestart={() => startGame(gameMode)}
          onExit={() => setGameState("title")}
        />
      )}
    </div>
  );
}
