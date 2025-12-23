import React, { useState, useEffect, useCallback } from 'react';
import { CountdownTimer } from './components/CountdownTimer';
import { CycleList } from './components/CycleList';
import { InfoCard } from './components/InfoCard';
import { ClockHeader } from './components/ClockHeader';
import { SatnaDashboard } from './components/SatnaDashboard';
import { ChakavakDashboard } from './components/ChakavakDashboard';
import { MarketDashboard } from './components/MarketDashboard';
import { calculateNextCycle, calculateTimeRemaining, calculateProgress } from './utils/timeHelpers';
import { Wallet, Activity, Repeat, Zap, FileText, LayoutGrid, ShieldCheck, Terminal } from 'lucide-react';
import { AppTab, FinancialState, CoinData, GroundingSource, FiatData, MetalData, Type } from './types';
import { GoogleGenAI } from "@google/genai";
import { getRotatingApiKey, blacklistKey, getBlacklistCount } from './utils/apiManager';

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'tether'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('paya');
  const [calculation, setCalculation] = useState(calculateNextCycle());
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(calculation.targetDate));
  const [progress, setProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [marketData, setMarketData] = useState<FinancialState>({
    coins: [],
    fiats: [],
    metals: [],
    lastUpdated: null,
    sources: [],
    isFetching: false
  });

  const addLog = (msg: string) => setSyncLogs(prev => [msg, ...prev].slice(0, 5));

  const performMarketSync = async (retryCount = 0, useSearch = true): Promise<void> => {
    const MAX_RETRIES = 10; // Aggressive retry
    const { key, index } = getRotatingApiKey();
    
    addLog(`Attempt ${retryCount + 1}: Using Key #${index} (${useSearch ? 'Search' : 'Phantom'})`);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const promptText = `URGENT MARKET REQUEST. Output ONLY valid JSON:
      {"usd":"Rials","eur":"Rials","gbp":"Rials","aed":"Rials","gold18":"Rials","emami":"Rials","silver":"Rials","oil":"USD","tether_rial":"Rials"}
      Current prices for Tehran Market. Use TGJU/Bonbast data. No talk.`;

      const response = await ai.models.generateContent({
        model: retryCount > 5 ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
        config: { 
          tools: useSearch ? [{ googleSearch: {} }] : [],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              usd: { type: Type.STRING },
              eur: { type: Type.STRING },
              gbp: { type: Type.STRING },
              aed: { type: Type.STRING },
              gold18: { type: Type.STRING },
              emami: { type: Type.STRING },
              silver: { type: Type.STRING },
              oil: { type: Type.STRING },
              tether_rial: { type: Type.STRING }
            },
            required: ["usd", "eur", "gbp", "aed", "gold18", "emami", "silver", "oil", "tether_rial"]
          }
        },
      });

      const resultJson = JSON.parse(response.text || '{}');
      const cleanNum = (val: any) => String(val || '0').replace(/[^\d.]/g, '') || '0';

      // Crypto
      let cryptoResults: any = {};
      try {
        const cRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=usd`);
        if (cRes.ok) cryptoResults = await cRes.json();
      } catch { /* ignore */ }

      setMarketData({
        coins: COIN_IDS.map(id => ({
          id,
          symbol: id === 'binancecoin' ? 'BNB' : (id === 'bitcoin' ? 'BTC' : (id === 'ethereum' ? 'ETH' : id.toUpperCase())),
          name: id === 'bitcoin' ? 'بیت‌کوین' : (id === 'ethereum' ? 'اتریوم' : id),
          price: cryptoResults[id]?.usd || 0
        })),
        fiats: [
          { id: 'usd', name: 'دلار آمریکا', symbol: 'USD', price: cleanNum(resultJson.usd) },
          { id: 'eur', name: 'یورو', symbol: 'EUR', price: cleanNum(resultJson.eur) },
          { id: 'gbp', name: 'پوند', symbol: 'GBP', price: cleanNum(resultJson.gbp) },
          { id: 'aed', name: 'درهم', symbol: 'AED', price: cleanNum(resultJson.aed) },
          { id: 'usdt_hidden', name: 'تتر داخلی', symbol: 'USDT', price: cleanNum(resultJson.tether_rial) },
        ],
        metals: [
          { id: 'gold18', name: 'طلای ۱۸ عیار', unit: 'گرم', price: cleanNum(resultJson.gold18) },
          { id: 'coin_emami', name: 'سکه امامی', unit: 'عدد', price: cleanNum(resultJson.emami) },
          { id: 'silver', name: 'نقره', unit: 'گرم', price: cleanNum(resultJson.silver) },
          { id: 'oil', name: 'نفت برنت', unit: 'دلار', price: cleanNum(resultJson.oil) },
        ],
        lastUpdated: new Date(),
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.filter(c => c.web)
          .map(c => ({ title: c.web?.title || 'شبکه متمرکز', uri: c.web?.uri || '#' })) || [],
        isFetching: false
      });
      
      setErrorStatus(null);
      addLog(`Sync Success! Key #${index} accepted.`);
    } catch (err: any) {
      const is403 = err.message.includes('403') || err.message.includes('permission');
      if (is403) blacklistKey(index);
      
      if (retryCount < MAX_RETRIES) {
        // Toggle search on alternate retries to bypass regional search blocks
        return performMarketSync(retryCount + 1, retryCount % 2 === 0 ? false : true);
      } else {
        setErrorStatus("تمامی کلیدها با محدودیت گوگل مواجه شدند. لطفاً VPN (آمریکا/اروپا) را چک کنید.");
        setMarketData(prev => ({ ...prev, isFetching: false }));
      }
    }
  };

  const fetchFinancialData = useCallback(() => {
    setMarketData(prev => ({ ...prev, isFetching: true }));
    performMarketSync(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!marketData.lastUpdated) fetchFinancialData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchFinancialData, marketData.lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newCalc = calculateNextCycle();
      setCalculation(newCalc);
      setTimeRemaining(calculateTimeRemaining(newCalc.targetDate));
      setProgress(calculateProgress(newCalc.targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
            <h1 className="text-xl font-black text-white tracking-tight">SHΞN™ Financial Hub</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <Activity className={`w-3 h-3 ${marketData.isFetching ? 'text-amber-500' : 'text-emerald-500'} animate-pulse`} />
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                 {marketData.isFetching ? `Rotating ${getBlacklistCount()} Blacklisted` : 'Core Stable'}
               </span>
            </div>
          </div>
        </div>
      </header>

      {errorStatus && (
        <div className="w-full max-w-lg mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="text-[11px] font-bold text-red-400 leading-5">{errorStatus}</span>
        </div>
      )}

      {marketData.isFetching && syncLogs.length > 0 && (
        <div className="w-full max-w-lg mb-4 p-3 bg-black border border-white/5 rounded-2xl font-mono text-[9px] text-indigo-400/70 overflow-hidden">
            <div className="flex items-center gap-2 mb-1 text-white/40">
                <Terminal className="w-3 h-3" /> 
                <span>PHANTOM_SYNC_LOGS:</span>
            </div>
            {syncLogs.map((log, i) => <div key={i} className="truncate">> {log}</div>)}
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
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
            <CountdownTimer timeRemaining={timeRemaining} nextCycle={calculation.nextCycle} isTomorrow={calculation.isTomorrow} />
            <CycleList nextCycleId={calculation.nextCycle.id} progress={progress} />
            <InfoCard />
          </div>
        )}
        {activeTab === 'satna' && <SatnaDashboard />}
        {activeTab === 'chakavak' && <ChakavakDashboard />}
        {activeTab === 'market' && <MarketDashboard data={marketData} onRefresh={fetchFinancialData} />}
      </main>

      <footer className="mt-auto py-10 text-center">
        <div className="text-[14px] font-bold footer-gradient opacity-90">
          <a href="https://T.me/shervini" target="_blank" rel="noopener noreferrer">Exclusive SHΞN™ made</a>
        </div>
        <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">Financial Intelligence Protocol</p>
      </footer>
    </div>
  );
};

export default App;