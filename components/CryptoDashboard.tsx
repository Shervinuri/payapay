import React from 'react';
import { Bitcoin, RefreshCw, AlertCircle, TrendingUp, ArrowRightLeft, Globe, ExternalLink, Landmark, ShieldCheck } from 'lucide-react';
import { CryptoPriceState } from '../types';

interface CryptoDashboardProps {
  data: CryptoPriceState;
  onRefresh: () => void;
}

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({ data, onRefresh }) => {
  const { coins, dollarRate, lastUpdated, sources, isFetching } = data;

  const formatPrice = (val: number, isRial: boolean = false) => {
    return new Intl.NumberFormat('fa-IR', {
      maximumFractionDigits: isRial ? 0 : (val < 10 ? 2 : 0)
    }).format(val);
  };

  const getRialPrice = (usdPrice: number) => {
    const rate = parseFloat(dollarRate) || 0;
    return usdPrice * rate;
  };

  const isRateReady = dollarRate !== '' && dollarRate !== '0';

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Smart Rate Section */}
      <div className="bg-gradient-to-b from-indigo-500/15 via-transparent to-transparent border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-32 h-32 text-indigo-400" />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                    Real-time Market Monitoring
                </label>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-500" />
                نرخ مرجع تتر (دلار آزاد)
            </h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isFetching}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all ${
                isFetching ? 'bg-indigo-500/20 text-indigo-300 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'در حال پایش...' : 'بروزرسانی آنی'}
          </button>
        </div>
        
        <div className="relative mb-8 z-10">
          {!isRateReady && isFetching ? (
            <div className="w-full h-[88px] bg-black/40 rounded-3xl animate-pulse flex items-center justify-center border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <span className="text-gray-400 font-bold text-xs">دریافت آخرین نرخ از منابع بانکی...</span>
                </div>
            </div>
          ) : (
            <>
              <div className="relative group/input">
                <input
                    type="text"
                    readOnly
                    value={isRateReady ? new Intl.NumberFormat('en-US').format(Number(dollarRate)) : '---,---'}
                    className={`w-full bg-black/60 border border-white/10 rounded-3xl p-6 text-left dir-ltr font-mono text-4xl font-black transition-all outline-none shadow-inner ${isRateReady ? 'text-white' : 'text-gray-800'}`}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Rial</span>
                    <span className="text-gray-600 text-[9px] font-bold">واحد پول رسمی</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-1 relative z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">منبع استعلام تایید شده</span>
                    <span className="text-[11px] text-gray-300 font-black truncate max-w-[140px]">
                        {sources.length > 0 ? sources[0].title : (isFetching ? 'در حال پایش منابع...' : 'آماده استعلام')}
                    </span>
                </div>
            </div>
            {lastUpdated && (
                <div className="text-left flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">آخرین بروزرسانی</span>
                    <span className="text-[11px] text-indigo-300 font-black font-mono">
                        {lastUpdated.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* Market List */}
      <div className="space-y-3">
        {coins.length === 0 && !isFetching ? (
          <div className="p-10 text-center bg-white/2 border border-white/5 rounded-[2.5rem]">
             <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-4" />
             <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">در انتظار دریافت داده‌های بازار</p>
          </div>
        ) : (
          coins.map((coin) => (
            <div key={coin.id} className="bg-white/2 border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 transition-all p-5 rounded-3xl flex items-center justify-between group shadow-lg">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                    coin.id === 'bitcoin' ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-orange-500/20' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/20'
                }`}>
                  <Bitcoin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{coin.name}</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">{coin.symbol}</span>
                </div>
              </div>

              <div className="text-left flex flex-col items-end">
                <div className="text-2xl font-mono font-black text-white dir-ltr tracking-tighter">
                  ${formatPrice(coin.price)}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/10">
                      {isRateReady ? formatPrice(getRialPrice(coin.price), true) : '---,---'}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold">ریال</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white/2 border border-white/5 p-5 rounded-3xl flex items-start gap-4">
        <TrendingUp className="w-5 h-5 text-indigo-400 mt-1" />
        <p className="text-[10px] text-gray-400 font-bold leading-6 text-justify">
          سیستم هوشمند SHΞN™ با بهره‌گیری از موتور پایش لحظه‌ای و تجمیع داده‌ها از منابع معتبر بازار آزاد، نرخ برابری ارز را به صورت خودکار در فواصل ۱۲ ساعته (۰۰:۰۰ و ۱۲:۰۰) بروزرسانی می‌کند تا محاسبات ریالی همیشه بر مبنای آخرین وضعیت بازار باشد.
        </p>
      </div>
    </div>
  );
};