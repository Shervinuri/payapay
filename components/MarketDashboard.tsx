import React from 'react';
import { Bitcoin, RefreshCw, Landmark, Globe, ShieldCheck, Coins, Banknote, TrendingUp, Sparkles, LayoutDashboard, Search, Droplets } from 'lucide-react';
import { FinancialState } from '../types';

interface MarketDashboardProps {
  data: FinancialState;
  onRefresh: () => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({ data, onRefresh }) => {
  const { coins, fiats, metals, lastUpdated, sources, isFetching } = data;

  const formatPrice = (price: string | number, isUSD: boolean = false) => {
    if (!price || price === '0') return '---,---';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '---,---';
    
    if (isUSD) {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num);
    }
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const getTetherRate = () => {
    // Hidden tether rate for crypto calculation
    const internal = fiats.find(f => f.id === 'usdt_hidden')?.price;
    return internal && !isNaN(parseFloat(internal)) ? parseFloat(internal) : 0;
  };

  // Filter out the hidden tether from the displayed list
  const displayFiats = fiats.filter(f => f.id !== 'usdt_hidden');

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Dynamic Market Header */}
      <div className="bg-gradient-to-br from-indigo-500/20 via-black/40 to-black border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="w-40 h-40 text-indigo-400" />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></span>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Market Protocol Active</label>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                پایش یکپارچه بازار
            </h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isFetching}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all ${
                isFetching ? 'bg-indigo-500/20 text-indigo-300 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'در حال دریافت...' : 'بروزرسانی زنده'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1 flex items-center gap-1">
                    <Search className="w-2.5 h-2.5" /> مرجع معتبر
                </span>
                <span className="text-[11px] text-gray-300 font-black truncate block">
                    {sources.length > 0 ? sources[0].title : (isFetching ? 'جستجوی شبکه...' : 'مرکز آمار SHΞN™')}
                </span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
                <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">زمان استعلام</span>
                <span className="text-[11px] text-indigo-400 font-mono font-black block dir-ltr">
                    {lastUpdated ? lastUpdated.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
            </div>
        </div>
      </div>

      {/* Fiat & Commodities Sections */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5">
            <div className="flex items-center gap-2 mb-4 px-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">ارزهای آزاد بازار تهران</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {displayFiats.map(fiat => (
                <div key={fiat.id} className="bg-black/40 border border-white/5 p-4 rounded-3xl group hover:border-emerald-500/30 transition-all">
                    <span className="text-[10px] font-black text-gray-500 block mb-1">{fiat.name}</span>
                    <div className="text-lg font-mono font-black text-white dir-ltr">{formatPrice(fiat.price)}</div>
                    <div className="text-[9px] text-emerald-500/40 font-bold uppercase mt-0.5">Rials / {fiat.symbol}</div>
                </div>
                ))}
            </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5">
            <div className="flex items-center gap-2 mb-4 px-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">فلزات، نفت و کالاها</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {metals.map(metal => (
                <div key={metal.id} className="bg-black/40 border border-white/5 p-4 rounded-3xl group hover:border-amber-500/30 transition-all relative overflow-hidden">
                    {metal.id === 'oil' && <Droplets className="absolute -right-2 -bottom-2 w-12 h-12 text-gray-800 opacity-20 rotate-12" />}
                    <span className="text-[10px] font-black text-gray-500 block mb-1">{metal.name}</span>
                    <div className="text-lg font-mono font-black text-white dir-ltr">
                        {metal.id === 'oil' ? `$${formatPrice(metal.price, true)}` : formatPrice(metal.price)}
                    </div>
                    <div className="text-[9px] text-amber-500/40 font-bold uppercase mt-0.5">{metal.unit}</div>
                </div>
                ))}
            </div>
        </div>
      </div>

      {/* Crypto Assets Section */}
      <div className="mt-2">
        <div className="flex items-center gap-2 px-4 mb-4">
             <Bitcoin className="w-5 h-5 text-indigo-400" />
             <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">بازار کریپتوکارنسی (قیمت جهانی و ریالی)</h3>
        </div>
        <div className="space-y-3">
            {coins.length > 0 ? coins.map((coin) => (
              <div key={coin.id} className="bg-gradient-to-r from-indigo-500/5 to-transparent border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all p-5 rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      coin.id === 'bitcoin' ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
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
                    ${formatPrice(coin.price, true)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                      <div className="text-[12px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/10">
                        {getTetherRate() > 0 ? formatPrice(coin.price * getTetherRate()) : 'در حال محاسبه...'}
                      </div>
                      <span className="text-[10px] text-gray-600 font-bold">ریال</span>
                  </div>
                </div>
              </div>
            )) : (
                <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/5 text-gray-500 font-bold uppercase text-xs">
                    در حال همگام‌سازی با شبکه...
                </div>
            )}
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem] flex items-start gap-4 mt-6">
        <TrendingUp className="w-6 h-6 text-indigo-400 mt-1" />
        <p className="text-[11px] text-gray-400 font-bold leading-7 text-justify">
          سیستم هوشمند SHΞN™ با تجمیع نرخ‌های بایننس و صرافی‌های داخلی، دقیق‌ترین نرخ تبدیل دارایی‌های دیجیتال را ارائه می‌دهد. استعلام‌های مدل زبانی از منابع مرجع، صحت داده‌ها را در لحظه تضمین می‌کنند.
        </p>
      </div>
    </div>
  );
};