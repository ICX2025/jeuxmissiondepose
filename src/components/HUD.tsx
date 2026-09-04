import { useEffect, useState } from 'react';
import { Clock, Star, AlertTriangle, Package, Wrench, Hammer } from 'lucide-react';
import type { GameStats } from '@/game/engine';
import { COLORS } from '@/game/types';

interface HUDProps {
  score: number;
  timeLeft: number;
  stats: GameStats;
  level: number;
}

export function HUD({ score, timeLeft, stats, level }: HUDProps) {
  const [timeFlash, setTimeFlash] = useState(false);

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      setTimeFlash(true);
      const t = setTimeout(() => setTimeFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Left: Score + Level */}
        <div className="glass-dark rounded-2xl px-4 py-3 flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-black text-2xl text-stroke-sm leading-none">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-bold">NIVEAU {level}</span>
          </div>
        </div>

        {/* Center: Timer */}
        <div
          className={`glass-dark rounded-2xl px-6 py-3 flex items-center gap-2 transition-all ${
            isUrgent ? (timeFlash ? 'scale-110' : 'scale-100') : ''
          }`}
          style={isUrgent ? { borderColor: COLORS.danger } : {}}
        >
          <Clock className={`w-6 h-6 ${isUrgent ? 'text-red-400' : 'text-white'}`} />
          <span
            className={`font-black text-3xl text-stroke-sm leading-none tabular-nums ${
              isUrgent ? 'text-red-400' : 'text-white'
            }`}
          >
            {timeStr}
          </span>
        </div>

        {/* Right: Stats */}
        <div className="glass-dark rounded-2xl px-4 py-3 flex flex-col gap-1.5 min-w-[120px]">
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold">{stats.deposited}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-bold">{stats.totalObjects}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Hammer className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold">{stats.broken}</span>
          </div>
          {stats.toxic > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-bold">{stats.toxic}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
