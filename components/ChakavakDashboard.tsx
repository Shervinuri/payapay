import React from 'react';
import { FileText, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { CHAKAVAK_HOURS } from '../constants';
import { formatTwoDigits } from '../utils/timeHelpers';

export const ChakavakDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
          <FileText className="text-indigo-400 w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-6">سامانه چکاوک (صیاد)</h2>
        
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-gray-300">مهلت واگذاری چک</span>
            </div>
            <span className="text-sm font-mono font-black text-white">{formatTwoDigits(CHAKAVAK_HOURS.cutoff.hour)}:{formatTwoDigits(CHAKAVAK_HOURS.cutoff.minute)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-gray-300">زمان تقریبی تسویه</span>
            </div>
            <span className="text-sm font-mono font-black text-white">{formatTwoDigits(CHAKAVAK_HOURS.settlement.hour)}:{formatTwoDigits(CHAKAVAK_HOURS.settlement.minute)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-400 text-sm mb-2">قوانین کلرینگ</h3>
            <p className="text-[11px] text-gray-400 leading-6 text-justify">
              چک‌های واگذار شده بعد از ساعت {formatTwoDigits(CHAKAVAK_HOURS.cutoff.hour)} صبح، معمولاً در روز کاری بعد پردازش می‌شوند. وضعیت نقدینگی چک در سامانه صیاد باید قبل از واگذاری استعلام شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};