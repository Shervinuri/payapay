import React from 'react';
import { TimeState, PayaCycle } from '../types';
import { formatTwoDigits } from '../utils/timeHelpers';

interface CountdownTimerProps {
  timeRemaining: TimeState;
  nextCycle: PayaCycle;
  isTomorrow: boolean;
}

const Digit = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-28 sm:w-24 sm:h-32 bg-gray-900/80 rounded-2xl flex items-center justify-center border border-white/10 shadow-[inset_0_2px_15px_rgba(0,0,0,1)] overflow-hidden">
        {/* Cylinder lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/40 pointer-events-none"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
        
        {/* Flip animation container */}
        <div key={value} className="animate-digitChange flex flex-col items-center justify-center">
          <span className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            {formatTwoDigits(value)}
          </span>
        </div>

        {/* Horizontal separation line */}
        <div className="absolute w-full h-[1px] bg-white/5 top-1/2 left-0 z-10"></div>
      </div>
      <span className="text-[11px] text-gray-500 mt-2 font-black uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  timeRemaining, 
  nextCycle,
  isTomorrow
}) => {
  const getTimePeriod = (hour: number) => {
    if (hour >= 0 && hour < 6) return 'بامداد';
    if (hour >= 6 && hour < 12) return 'صبح';
    if (hour >= 12 && hour < 16) return 'ظهر';
    return 'عصر';
  };

  const period = getTimePeriod(nextCycle.hour);

  return (
    <div className="w-full relative group">
      {/* The Main Cylinder Body */}
      <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[2.5rem] p-8 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Header Label - Centered */}
        <div className="flex flex-col items-center mb-10 relative z-20">
          <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.6)]"></span>
             زمان باقی‌مانده تا تسویه
          </div>
        </div>

        {/* Clock Body */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 dir-ltr mb-4" dir="ltr">
          <Digit value={timeRemaining.hours} label="ساعت" />
          <div className="text-4xl text-gray-700 font-black mb-6">:</div>
          <Digit value={timeRemaining.minutes} label="دقیقه" />
          <div className="text-4xl text-gray-700 font-black mb-6">:</div>
          <Digit value={timeRemaining.seconds} label="ثانیه" />
        </div>

        {/* Status indicator - Updated Text & Colors */}
        <div className="mt-4 flex justify-center">
             <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span>واریز بعدی</span>
                {isTomorrow && <span className="text-amber-500">فردا</span>}
                <span>راس ساعت</span>
                <span className="text-indigo-400 font-mono text-sm">{formatTwoDigits(nextCycle.hour)}:{formatTwoDigits(nextCycle.minute)}</span>
                <span className="text-amber-500">{period}</span>
                <span>می‌باشد</span>
             </div>
        </div>

        {/* Decorative gloss */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes digitChange {
          0% { transform: translateY(10px); opacity: 0; filter: blur(5px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        .animate-digitChange {
          animation: digitChange 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
};