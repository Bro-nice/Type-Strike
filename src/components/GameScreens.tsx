import React from "react";
import { Play, RotateCcw, Volume2, VolumeX, Shield, Trophy, Zap, Flame, Award, Terminal } from "lucide-react";

export type GameMode = "arcade" | "time-attack" | "code" | "zen";

interface TitleScreenProps {
  onStart: (mode: GameMode) => void;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  highScore: number;
  bestWpm: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  selectedMode,
  onSelectMode,
  highScore,
  bestWpm,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-10 select-none font-['Chakra_Petch',sans-serif] bg-slate-950/60 backdrop-blur-[2px]">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
            CYBER DEFENSE SYSTEM ONLINE
          </span>
        </div>

        <div className="flex items-center gap-4">
          {highScore > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <Trophy size={13} className="text-amber-400" />
              <span className="text-slate-400">BEST:</span>
              <span className="font-bold text-white">{highScore.toLocaleString()}</span>
              <span className="text-cyan-400 ml-1">({bestWpm} WPM)</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup with 35% negative space */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        <div className="relative mb-4">
          {/* Subtle backglow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-rose-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Bespoke inline SVG Logo */}
          <svg viewBox="0 0 680 120" className="w-full max-w-xl h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="cyberTitleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="strikeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* TYPE */}
            <text
              x="50"
              y="90"
              fontFamily="'Chakra Petch', sans-serif"
              fontSize="92"
              fontWeight="800"
              letterSpacing="6"
              fill="url(#cyberTitleGrad)"
            >
              TYPE
            </text>

            {/* STRIKE */}
            <text
              x="300"
              y="90"
              fontFamily="'Chakra Petch', sans-serif"
              fontSize="92"
              fontWeight="800"
              letterSpacing="8"
              fill="url(#strikeGrad)"
            >
              STRIKE
            </text>

            {/* Cyber slash lines */}
            <line x1="50" y1="108" x2="630" y2="108" stroke="#38bdf8" strokeWidth="3" opacity="0.6" />
            <line x1="285" y1="114" x2="480" y2="114" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
          </svg>
        </div>

        <p className="text-sm sm:text-base text-slate-300 font-medium tracking-wide max-w-lg mb-8">
          Type incoming hostile words to unleash plasma lasers, trigger EMP chain blasts, and protect your orbital citadel.
        </p>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-8">
          {[
            { id: "arcade", label: "Arcade Defense", icon: "🚀", desc: "Multi-wave alien assault" },
            { id: "time-attack", label: "Time Attack", icon: "⏱️", desc: "60-second WPM rush" },
            { id: "code", label: "Hacker Matrix", icon: "💻", desc: "Code syntax keywords" },
            { id: "zen", label: "Zen Mode", icon: "🧘", desc: "Endless stress-free flow" },
          ].map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMode(m.id as GameMode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600/30 border-cyan-400 shadow-lg shadow-indigo-500/20 text-white scale-[1.02]"
                    : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{m.icon}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {m.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {m.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Start CTA */}
        <button
          type="button"
          onClick={() => onStart(selectedMode)}
          className="group px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold text-lg sm:text-xl tracking-wider uppercase shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Play size={22} className="fill-white group-hover:translate-x-1 transition-transform" />
          <span>Launch Defense [Enter]</span>
        </button>
      </div>

      {/* Control Hint Line */}
      <div className="w-full text-center">
        <p className="text-xs font-mono text-slate-400 tracking-wider">
          Type matching letters · Space/Enter for EMP Smart Bomb · Esc to Pause · M to Mute
        </p>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExit,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none font-['Chakra_Petch',sans-serif]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
        <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block mb-2" />
        <h2 className="text-2xl font-extrabold text-white tracking-wider uppercase mb-1">
          TACTICAL PAUSE
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">Simulation halted. Ready when you are.</p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer"
          >
            Resume Defense (Esc)
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            Restart Mission
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {isMuted ? "Unmute Sound" : "Mute Sound"}
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  wordsDestroyed: number;
  maxCombo: number;
  wave: number;
  isVictory?: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  wpm,
  accuracy,
  totalKeystrokes,
  wordsDestroyed,
  maxCombo,
  wave,
  isVictory = false,
  onRestart,
  onExit,
}) => {
  // Calculate Rank
  let rank = "C";
  let rankColor = "text-slate-300";
  let rankTitle = "Cadet Typist";

  if (wpm >= 85 && accuracy >= 95) {
    rank = "S";
    rankColor = "text-amber-400";
    rankTitle = "Cyber Warlord";
  } else if (wpm >= 65 && accuracy >= 90) {
    rank = "A";
    rankColor = "text-cyan-400";
    rankTitle = "Plasma Ace";
  } else if (wpm >= 45 && accuracy >= 85) {
    rank = "B";
    rankColor = "text-indigo-400";
    rankTitle = "Shield Operator";
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-['Chakra_Petch',sans-serif]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center">
        {/* Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 blur-3xl rounded-full pointer-events-none ${
            isVictory ? "bg-emerald-500/20" : "bg-rose-500/20"
          }`}
        />

        <div className="relative z-10">
          <span className="text-3xl mb-1 block">{isVictory ? "🏆" : "💥"}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            {isVictory ? "DEFENSE VICTORY!" : "BASE COMPROMISED"}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1 mb-5">
            {isVictory ? "All cyber hostiles neutralized!" : "Shields depleted. Review your tactical combat data."}
          </p>

          {/* Rank Badge & Score */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                COMBAT RANK
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold font-mono ${rankColor}`}>
                  {rank}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {rankTitle}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                FINAL SCORE
              </span>
              <span className="text-2xl font-extrabold font-mono text-white">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                TYPING SPEED
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {wpm} <span className="text-xs text-slate-400">WPM</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                ACCURACY
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                TARGETS DESTROYED
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {wordsDestroyed}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                MAX STREAK COMBO
              </span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {maxCombo}x
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              Replay Mission [Enter]
            </button>

            <button
              type="button"
              onClick={onExit}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Menu [Esc]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
