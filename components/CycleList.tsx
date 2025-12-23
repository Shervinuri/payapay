import React from 'react';
import { PAYA_CYCLES } from '../constants';
import { Clock, Sun, Moon, Hourglass } from 'lucide-react';
import { formatTwoDigits } from '../utils/timeHelpers';

interface CycleListProps {
  nextCycleId: number;
  progress: number;
}

export const CycleList: React.FC<CycleListProps> = ({ nextCycleId, progress }) => {
  const getTimePeriod = (hour: number) => {
    if (hour >= 0 && hour < 6) return 'بامداد';
    if (hour >= 6 && hour < 12) return 'صبح';
    if (hour >= 12 && hour < 16) return 'ظهر';
    return 'عصر';
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4 px-2">
         <Clock className="w-4 h-4 text-gray-500" />
         <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">چرخه‌های تسویه امروز</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYA_CYCLES.map((cycle) => {
          const isActive = cycle.id === nextCycleId;
          const isDay = cycle.hour >= 6 && cycle.hour < 18;
          const period = getTimePeriod(cycle.hour);
          const shouldFlip = progress >= 50;
          
          return (
            <div
              key={cycle.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                isActive
                  ? 'h-[72px] bg-indigo-500/5 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                  : 'h-14 bg-white/2 border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all'
              } flex flex-col justify-center px-4`}
            >
              {/* Progress Background - Fixed: Fills from Left to Right */}
              {isActive && (
                <div 
                  className="absolute inset-y-0 left-0 bg-indigo-600/20 transition-all duration-1000 ease-linear border-r border-indigo-500/30"
                  style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
                </div>
              )}

              {isActive ? (
                /* ACTIVE LAYOUT - Swaps positions at 50% progress */
                /* RTL context: flex-row puts first child on the Right. */
                /* shouldFlip = true -> flex-row-reverse puts first child on the Left. */
                <div className={`flex items-center justify-between w-full relative z-10 transition-all duration-700 ${shouldFlip ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Info Block (Label and Time) */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                      {isDay ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs font-black text-white leading-tight">
                        {cycle.label}
                      </h3>
                      <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                         <span className="font-mono">{formatTwoDigits(cycle.hour)}:{formatTwoDigits(cycle.minute)}</span>
                         <span className="opacity-60">{period}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Block (Percentage and Hourglass) */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-black text-indigo-400 tracking-tighter">
                      {Math.round(progress)}%
                    </span>
                    <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Hourglass className="w-3.5 h-3.5 text-indigo-400 animate-flip-hourglass" />
                    </div>
                  </div>
                </div>
              ) : (
                /* INACTIVE LAYOUT */
                <div className="grid grid-cols-3 w-full items-center relative z-10">
                  <div className="text-[11px] font-black text-gray-400 text-right">
                    {cycle.label}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-mono font-black text-gray-300 tracking-tighter">
                      {formatTwoDigits(cycle.hour)}:{formatTwoDigits(cycle.minute)}
                    </span>
                    <div className="text-gray-600">
                        {isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-gray-500 text-left">
                    {period}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flip-hourglass {
          0%, 80% { transform: rotate(0deg); }
          90%, 100% { transform: rotate(180deg); }
        }
        .animate-flip-hourglass {
          animation: flip-hourglass 3s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
      `}</style>
    </div>
  );
};