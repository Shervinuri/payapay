import React, { useState, useEffect, useCallback } from 'react';
import { CountdownTimer } from './components/CountdownTimer';
import { CycleList } from './components/CycleList';
import { InfoCard } from './components/InfoCard';
import { ClockHeader } from './components/ClockHeader';
import { SatnaDashboard } from './components/SatnaDashboard';
import { ChakavakDashboard } from './components/ChakavakDashboard';
import { MarketDashboard } from './components/MarketDashboard';
import { calculateNextCycle, calculateTimeRemaining, calculateProgress } from './utils/timeHelpers';
import { Wallet, Activity, Repeat, Zap, FileText, LayoutGrid, AlertCircle } from 'lucide-react';
import { AppTab, FinancialState, CoinData, GroundingSource, FiatData, MetalData } from './types';
import { GoogleGenAI } from "@google/genai";
import { getRotatingApiKey } from './utils/apiManager';

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'tether'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('paya');
  const [calculation, setCalculation] = useState(calculateNextCycle());
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(calculation.targetDate));
  const [progress, setProgress] = useState(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [marketData, setMarketData] = useState<FinancialState>({
    coins: [],
    fiats: [],
    metals: [],
    lastUpdated: null,
    sources: [],
    isFetching: false
  });

  const fetchFinancialData = useCallback(async (retryCount = 0) => {
    if (retryCount === 0) {
      setMarketData(prev => ({ ...prev, isFetching: true }));
      setErrorStatus(null);
    }
    
    try {
      // 1. Crypto Fetch (Independent)
      let cryptoResults = { bitcoin: { usd: 0 }, ethereum: { usd: 0 }, solana: { usd: 0 }, binancecoin: { usd: 0 }, tether: { usd: 1 } };
      try {
        const cryptoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=usd`);
        if (cryptoRes.ok) cryptoResults = await cryptoRes.json();
      } catch (ce) { console.warn("Crypto Fallback Active"); }

      // 2. Gemini AI Integration with Multi-Key Support
      const currentKey = getRotatingApiKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const promptText = `Find Tehran Market Prices. Format as JSON: {"usd": "val", "eur": "val", "gbp": "val", "aed": "val", "gold18": "val", "emami": "val", "silver": "val", "oil": "val", "tether_rial": "val"}. Use TGJU/Bonbast sources.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: { 
          tools: [{ googleSearch: {} }]
        },
      });

      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from SHΞN™ core.");
      }

      const responseText = response.text || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("JSON Parse Error: No block found.");

      const resultJson = JSON.parse(jsonMatch[0]);
      const cleanNum = (val: any) => String(val || '0').replace(/[^\d.]/g, '') || '0';

      const mappedCoins: CoinData[] = [
        { id: 'bitcoin', symbol: 'BTC', name: 'بیت‌کوین', price: cryptoResults.bitcoin?.usd || 0 },
        { id: 'ethereum', symbol: 'ETH', name: 'اتریوم', price: cryptoResults.ethereum?.usd || 0 },
        { id: 'solana', symbol: 'SOL', name: 'سولانا', price: cryptoResults.solana?.usd || 0 },
        { id: 'binancecoin', symbol: 'BNB', name: 'بایننس‌کوین', price: cryptoResults.binancecoin?.usd || 0 },
        { id: 'tether', symbol: 'USDT', name: 'تتر (جهانی)', price: cryptoResults.tether?.usd || 1 },
      ];

      setMarketData({
        coins: mappedCoins,
        fiats: [
          { id: 'usd', name: 'دلار آمریکا (آزاد)', symbol: 'USD', price: cleanNum(resultJson.usd) },
          { id: 'eur', name: 'یورو', symbol: 'EUR', price: cleanNum(resultJson.eur) },
          { id: 'gbp', name: 'پوند انگلیس', symbol: 'GBP', price: cleanNum(resultJson.gbp) },
          { id: 'aed', name: 'درهم امارات', symbol: 'AED', price: cleanNum(resultJson.aed) },
          { id: 'usdt_hidden', name: 'تتر داخلی', symbol: 'USDT', price: cleanNum(resultJson.tether_rial) },
        ],
        metals: [
          { id: 'gold18', name: 'طلای ۱۸ عیار', unit: 'گرم', price: cleanNum(resultJson.gold18) },
          { id: 'coin_emami', name: 'سکه امامی', unit: 'عدد', price: cleanNum(resultJson.emami) },
          { id: 'silver', name: 'نقره خام', unit: 'گرم', price: cleanNum(resultJson.silver) },
          { id: 'oil', name: 'نفت برنت', unit: 'بشکه (دلار)', price: cleanNum(resultJson.oil) },
        ],
        lastUpdated: new Date(),
        sources: response.candidates[0].groundingMetadata?.groundingChunks
          ?.filter(c => c.web)
          .map(c => ({ title: c.web?.title || 'منبع معتبر', uri: c.web?.uri || '#' })) || [],
        isFetching: false
      });
    } catch (e: any) {
      console.error(`Attempt ${retryCount + 1} Failed:`, e);
      if (retryCount < 3) {
        // Exponential backoff or immediate retry with new key
        setTimeout(() => fetchFinancialData(retryCount + 1), 1000);
      } else {
        setErrorStatus("عدم پاسخگویی شبکه؛ لطفاً از ابزار تغییر آی‌پی (VPN) استفاده کنید.");
        setMarketData(prev => ({ ...prev, isFetching: false }));
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch with a small delay for Netlify environment stabilization
    const timer = setTimeout(() => {
      if (!marketData.lastUpdated) fetchFinancialData();
    }, 1500);
    
    const interval = setInterval(fetchFinancialData, 1800000); 
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchFinancialData, marketData.lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newCalc = calculateNextCycle();
      if (newCalc.nextCycle.id !== calculation.nextCycle.id || newCalc.isTomorrow !== calculation.isTomorrow) {
        setCalculation(newCalc);
      }
      setTimeRemaining(calculateTimeRemaining(newCalc.targetDate));
      setProgress(calculateProgress(newCalc.targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [calculation]);

  const tabs = [
    { id: 'paya', label: 'پایا', icon: Repeat },
    { id: 'satna', label: 'ساتنا', icon: Zap },
    { id: 'chakavak', label: 'چکاوک', icon: FileText },
    { id: 'market', label: 'بازار زنده', icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-6 px-4 selection:bg-indigo-500/30">
      <header className="w-full max-w-lg mb-6 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">SHΞN™ Banking Hub</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <Activity className={`w-3 h-3 ${marketData.isFetching ? 'text-amber-500' : 'text-emerald-500'} animate-pulse`} />
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                 {marketData.isFetching ? 'Protocol: Safe-Sync Active' : 'Market Core: Online'}
               </span>
            </div>
          </div>
        </div>
      </header>

      {errorStatus && (
        <div className="w-full max-w-lg mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-bold text-red-400">{errorStatus}</span>
        </div>
      )}

      <nav className="w-full max-w-lg mb-6 p-1 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-1 backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-600/20"></div>
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : ''}`} />
              <span className="text-xs font-black relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="w-full max-w-lg flex flex-col gap-4">
        <ClockHeader />
        {activeTab === 'paya' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CountdownTimer 
              timeRemaining={timeRemaining} 
              nextCycle={calculation.nextCycle}
              isTomorrow={calculation.isTomorrow}
            />
            <CycleList nextCycleId={calculation.nextCycle.id} progress={progress} />
            <InfoCard />
          </div>
        )}
        {activeTab === 'satna' && <SatnaDashboard />}
        {activeTab === 'chakavak' && <ChakavakDashboard />}
        {activeTab === 'market' && <MarketDashboard data={marketData} onRefresh={() => fetchFinancialData(0)} />}
      </main>

      <footer className="mt-auto py-10 text-center">
        <div className="text-[14px] font-bold footer-gradient opacity-90">
          <a href="https://T.me/shervini" target="_blank" rel="noopener noreferrer">
            Exclusive SHΞN™ made
          </a>
        </div>
        <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">
          Financial Intelligence Protocol
        </p>
      </footer>
    </div>
  );
};

export default App;