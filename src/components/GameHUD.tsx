import React from "react";
import { Shield, Zap, Flame, Volume2, VolumeX, Pause, Activity, Crosshair } from "lucide-react";

interface GameHUDProps {
  score: number;
  wpm: number;
  accuracy: number;
  combo: number;
  hullHealth: number;
  wave: number;
  empCharge: number; // 0 to 100
  timeLeft?: number; // for time-attack
  gameMode: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  activeWord?: string;
  typedChars?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  wpm,
  accuracy,
  combo,
  hullHealth,
  wave,
  empCharge,
  timeLeft,
  gameMode,
  isMuted,
  onToggleMute,
  onPause,
  activeWord,
  typedChars = 0,
}) => {
  const isOverdrive = combo >= 20;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 select-none font-['Chakra_Petch',sans-serif]">
      {/* Top Perimeter Status Cluster */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Hull Shield & Wave */}
        <div className="flex flex-col gap-1.5 bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 rounded-xl backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Shield
                size={14}
                className={hullHealth > 30 ? "text-cyan-400" : "text-rose-400 animate-pulse"}
              />
              <span>SHIELD HULL</span>
            </div>
            <span
              className={`text-xs font-mono font-bold tabular-nums ${
                hullHealth > 50
                  ? "text-cyan-300"
                  : hullHealth > 25
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {Math.max(0, Math.round(hullHealth))}%
            </span>
          </div>

          {/* Health Bar */}
          <div className="w-36 sm:w-44 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                hullHealth > 50
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                  : hullHealth > 25
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-rose-500 to-red-600 animate-pulse"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, hullHealth))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-0.5">
            <span>
              {gameMode === "time-attack"
                ? `TIME: ${timeLeft || 0}s`
                : gameMode === "code"
                ? "HACKER CODE"
                : `WAVE ${wave}`}
            </span>
            <span className="text-slate-500 uppercase">{gameMode}</span>
          </div>
        </div>

        {/* Center: Live WPM & Accuracy */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/70 border border-slate-800/80 px-5 py-2.5 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              SPEED
            </span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-400 tabular-nums">
                {wpm}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">WPM</span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              ACCURACY
            </span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {accuracy}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">%</span>
            </div>
          </div>
        </div>

        {/* Right: Score & Combo Multiplier */}
        <div className="flex flex-col items-end gap-1.5 bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 rounded-xl backdrop-blur-sm pointer-events-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              SCORE
            </span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Combo badge */}
          <div className="flex items-center gap-1.5">
            {combo > 1 && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border transition-all ${
                  isOverdrive
                    ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/50 animate-bounce"
                    : combo >= 10
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Flame
                  size={12}
                  className={isOverdrive ? "text-amber-400 fill-amber-400 animate-spin" : "text-indigo-400"}
                />
                <span>{combo}x {isOverdrive ? "OVERDRIVE!" : "COMBO"}</span>
              </div>
            )}

            {/* Pause & Mute controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleMute}
                title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={onPause}
                title="Pause (Esc)"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Pause size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perimeter: Target Guidance & EMP Ready Indicator */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom Left: Locked Target Preview */}
        <div className="bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl backdrop-blur-sm pointer-events-auto min-w-[140px]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Crosshair size={12} className={activeWord ? "text-amber-400 animate-spin" : "text-slate-600"} />
            <span>Target Lock</span>
          </div>
          {activeWord ? (
            <div className="font-mono text-base font-bold tracking-wider mt-0.5">
              <span className="text-amber-400">{activeWord.slice(0, typedChars)}</span>
              <span className="text-white underline decoration-cyan-400 decoration-2">
                {activeWord.slice(typedChars)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-mono italic mt-0.5 block">
              Type any letter to lock...
            </span>
          )}
        </div>

        {/* Bottom Right: Smart Bomb EMP Meter */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 rounded-xl backdrop-blur-sm pointer-events-auto">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-amber-400 uppercase">
              <Zap size={13} className={empCharge >= 100 ? "text-amber-400 animate-bounce" : "text-slate-500"} />
              <span>{empCharge >= 100 ? "EMP READY! (Space / Enter)" : "EMP CHARGE"}</span>
            </div>
            <div className="w-28 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  empCharge >= 100
                    ? "bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse"
                    : "bg-amber-500/70"
                }`}
                style={{ width: `${Math.min(100, empCharge)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
