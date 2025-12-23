import React, { useState, useEffect } from 'react';
import { Calendar, Clock as ClockIcon } from 'lucide-react';

export const ClockHeader: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Only update every minute since seconds are removed
    return () => clearInterval(timer);
  }, []);

  // Format parts individually for the exact phrasing: "امروز [روز] ، [عدد] [ماه]"
  const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(now);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(now);
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(now);

  // Time format without seconds
  const timeString = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  return (
    <div className="w-full flex flex-row items-center justify-center gap-4 px-2 mb-2 border-b border-white/5 pb-2">
      {/* Right Side: Date */}
      <div className="flex items-center gap-1.5 text-gray-300">
        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[11px] font-black tracking-tight whitespace-nowrap">
          امروز {weekday} ، {day} {month}
        </span>
      </div>
      
      {/* Vertical Divider */}
      <div className="w-[1px] h-3 bg-white/10"></div>
      
      {/* Left Side: Time (Hours and Minutes only) */}
      <div className="flex items-center gap-1.5 text-indigo-300">
        <ClockIcon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-mono font-black tracking-widest dir-ltr">
          {timeString}
        </span>
      </div>
    </div>
  );
};