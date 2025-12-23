import React, { useState, useEffect, useCallback } from 'react';
import { Bitcoin, RefreshCw, AlertCircle, TrendingUp, ArrowRightLeft, Globe, ExternalLink, Landmark } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
}

interface GroundingSource {
  title: string;
  uri: string;
}

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'tether'];

export const CryptoDashboard: React.FC = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [dollarRate, setDollarRate] = useState<string>('650000');
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingRate, setFetchingRate] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const fetchLiveDollarRate = useCallback(async () => {
    setFetchingRate(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `آخرین قیمت لحظه‌ای خرید تتر (USDT) یا دلار آزاد را در بازار ایران از سایت‌های معتبر مثل "تبدیل" (Tabdil)، "نوبیتکس" (Nobitex) یا "TGJU" جستجو کن. 
        فقط و فقط عدد نهایی را به "ریال" (Rial) برگردان. 
        اگر قیمت به تومان بود، آن را ده برابر کن تا به ریال تبدیل شود. 
        خروجی فقط شامل عدد باشد.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      // Clean string from any non-numeric characters except digits
      const numericValue = text.replace(/[^0-9]/g, '');
      
      if (numericValue && numericValue.length >= 5) {
        setDollarRate(numericValue);
      }

      // Extract citations to show exactly where the price came from
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources: GroundingSource[] = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web?.title || 'مربع ارز',
            uri: chunk.web?.uri || '#'
          }));
        setSources(extractedSources);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch dollar rate via Specialized Search:', e);
    } finally {
      setFetchingRate(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error('API limit reached');
      
      const data = await response.json();
      const mappedCoins: CoinData[] = [
        { id: 'bitcoin', symbol: 'BTC', name: 'بیت‌کوین', price: data.bitcoin.usd },
        { id: 'ethereum', symbol: 'ETH', name: 'اتریوم', price: data.ethereum.usd },
        { id: 'solana', symbol: 'SOL', name: 'سولانا', price: data.solana.usd },
        { id: 'binancecoin', symbol: 'BNB', name: 'بایننس‌کوین', price: data.binancecoin.usd },
        { id: 'tether', symbol: 'USDT', name: 'تتر', price: data.tether.usd },
      ];

      setCoins(mappedCoins);
      setLoading(false);
      setError(false);
    } catch (e) {
      console.warn('Crypto API failed', e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchLiveDollarRate();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices, fetchLiveDollarRate]);

  const formatPrice = (val: number, isRial: boolean = false) => {
    return new Intl.NumberFormat('fa-IR', {
      maximumFractionDigits: isRial ? 0 : (val < 10 ? 2 : 0)
    }).format(val);
  };

  const getRialPrice = (usdPrice: number) => {
    const rate = parseFloat(dollarRate) || 0;
    return usdPrice * rate;
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Smart Rate Section */}
      <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="w-20 h-20 text-indigo-400" />
        </div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                Live Exchange Rate
            </label>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                نرخ تتر (بازار آزاد)
            </h2>
          </div>
          <button 
            onClick={fetchLiveDollarRate}
            disabled={fetchingRate}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${
                fetchingRate ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingRate ? 'animate-spin' : ''}`} />
            {fetchingRate ? 'در حال پایش منابع...' : 'استعلام هوشمند'}
          </button>
        </div>
        
        <div className="relative mb-6 z-10">
          <input
            type="text"
            value={new Intl.NumberFormat('en-US').format(Number(dollarRate))}
            onChange={(e) => setDollarRate(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-left dir-ltr font-mono text-3xl font-black text-white focus:border-indigo-500 transition-all outline-none shadow-inner"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-end">
            <span className="text-indigo-400 text-[10px] font-black uppercase">Rials</span>
            <span className="text-gray-500 text-[9px] font-bold">واحد رسمی</span>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500/80 font-black">منبع تایید شده توسط هوش مصنوعی:</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {sources.slice(0, 1).map((src, idx) => (
                <a 
                  key={idx} 
                  href={src.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-gray-300 hover:text-indigo-400 flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold truncate max-w-[80%] underline decoration-indigo-500/30 decoration-2 underline-offset-4">{src.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Market List */}
      <div className="space-y-3">
        {error && coins.length === 0 ? (
          <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-3xl">
             <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
             <p className="text-sm font-bold text-red-400">خطا در ارتباط با بازار جهانی</p>
          </div>
        ) : (
          coins.map((coin) => (
            <div key={coin.id} className="bg-white/2 border border-white/5 hover:border-indigo-500/20 hover:bg-white/5 transition-all p-5 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    coin.id === 'bitcoin' ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  <Bitcoin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{coin.name}</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{coin.symbol}</span>
                </div>
              </div>

              <div className="text-left flex flex-col items-end">
                <div className="text-xl font-mono font-black text-white dir-ltr tracking-tighter">
                  ${formatPrice(coin.price)}
                </div>
                <div className="text-[11px] font-black text-indigo-400/80 bg-indigo-400/5 px-2 py-0.5 rounded-lg">
                  {formatPrice(getRialPrice(coin.price), true)} <span className="text-[9px] opacity-60">ریال</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-indigo-400 mt-0.5" />
        <p className="text-[10px] text-indigo-300 font-medium leading-5 text-justify">
          سیستم مانیتورینگ SHΞN™ با پایش همزمان منابع داخلی (تبدیل، نوبیتکس) و قیمت‌های جهانی، دقیق‌ترین نرخ تبدیل ریالی را بر اساس «دلار آزاد» محاسبه می‌کند.
        </p>
      </div>
    </div>
  );
};