import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { SATNA_HOURS } from '../constants';
import { formatTwoDigits } from '../utils/timeHelpers';

export const SatnaDashboard: React.FC = () => {
  const [status, setStatus] = useState({ isOpen: false, timeLeft: '' });

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday, 6 is Saturday
      const isFriday = day === 5;
      const isThursday = day === 4;
      
      const start = new Date(now);
      start.setHours(SATNA_HOURS.start.hour, SATNA_HOURS.start.minute, 0);
      
      const end = new Date(now);
      const limit = isThursday ? SATNA_HOURS.thursdayEnd : SATNA_HOURS.end;
      end.setHours(limit.hour, limit.minute, 0);

      const isOpen = !isFriday && now >= start && now <= end;
      
      let timeLeft = '--:--:--';
      if (isOpen) {
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timeLeft = `${formatTwoDigits(h)}:${formatTwoDigits(m)}:${formatTwoDigits(s)}`;
      }

      setStatus({ isOpen, timeLeft });
    };

    checkStatus();
    const timer = setInterval(checkStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${status.isOpen ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${status.isOpen ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
            <Zap className="text-white w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-black text-white mb-2">سامانه ساتنا (RTGS)</h2>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-8 ${status.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${status.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            {status.isOpen ? 'درگاه عملیاتی و فعال' : 'درگاه خارج از ساعات اداری'}
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">زمان باقی‌مانده تا بسته شدن درگاه</span>
            <span className="text-6xl font-mono font-black text-white tracking-tighter dir-ltr">
              {status.timeLeft}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">امنیت شبکه</span>
            <span className="text-xs font-bold text-gray-300">پروتکل SSLv3</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">سقف انتقال</span>
            <span className="text-xs font-bold text-gray-300">نامحدود (بانکی)</span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-indigo-400 mt-0.5" />
        <p className="text-[10px] text-indigo-300/80 leading-5 text-justify">
          حواله‌های ساتنا به صورت آنی پردازش می‌شوند. زمان واریز به حساب مقصد در روزهای کاری معمولاً بین ۵ تا ۳۰ دقیقه پس از تایید نهایی در مبدأ است.
        </p>
      </div>
    </div>
  );
};