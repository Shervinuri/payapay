import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const InfoCard: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Primary Info */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
            <Info className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-amber-500 text-sm mb-1">راهنمای تسویه</h3>
            <p className="text-[11px] text-gray-400 leading-6 text-justify">
              واریز به حساب مقصد معمولاً بین ۳۰ دقیقه تا ۲ ساعت بعد از زمان رسمی چرخه پایا انجام می‌شود. در روزهای تعطیل رسمی، تسویه در اولین روز کاری بعد صورت می‌پذیرد.
            </p>
          </div>
        </div>
      </div>

      {/* Warning/Caution */}
      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <p className="text-[10px] text-red-300 font-medium">
          توجه: مبنای محاسبات، ساعت رسمی سرورهای بانکی ایران است.
        </p>
      </div>
    </div>
  );
};