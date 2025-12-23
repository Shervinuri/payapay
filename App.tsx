import React, { useState, useEffect, useCallback } from 'react';
import { CountdownTimer } from './components/CountdownTimer';
import { CycleList } from './components/CycleList';
import { InfoCard } from './components/InfoCard';
import { ClockHeader } from './components/ClockHeader';
import { SatnaDashboard } from './components/SatnaDashboard';
import { ChakavakDashboard } from './components/ChakavakDashboard';
import { MarketDashboard } from './components/MarketDashboard';
import { calculateNextCycle, calculateTimeRemaining, calculateProgress } from './utils/timeHelpers';
import { Wallet, Activity, Repeat, Zap, FileText, LayoutGrid } from 'lucide-react';
import { AppTab, FinancialState, CoinData, GroundingSource, FiatData, MetalData, Type } from './types';
import { GoogleGenAI } from "@google/genai";
import { getRotatingApiKey } from './utils/apiManager';

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'tether'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('paya');
  const [calculation, setCalculation] = useState(calculateNextCycle());
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(calculation.targetDate));
  const [progress, setProgress] = useState(0);

  const [marketData, setMarketData] = useState<FinancialState>({
    coins: [],
    fiats: [],
    metals: [],
    lastUpdated: null,
    sources: [],
    isFetching: false
  });

  const fetchFinancialData = useCallback(async () => {
    setMarketData(prev => ({ ...prev, isFetching: true }));
    
    try {
      // 1. Fetch Crypto prices from public API
      const cryptoPromise = fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=usd`
      ).then(r => r.json());

      // 2. Fetch Fiat and Metals using Gemini with Hardcoded Key Rotation
      // Using the pool from apiManager as per SHΞN™ Lord Command
      const currentKey = getRotatingApiKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Extract exact current market prices for: 1. USD (Free Market Tehran Rial), 2. EUR (Rial), 3. GBP (British Pound Rial), 4. UAE Dirham (Rial), 5. Gold 18k (Rial per gram), 6. Emami Gold Coin (Rial), 7. Silver 999 (Rial per gram), 8. Brent Crude Oil (USD price per barrel), 9. Tether (USDT internal Rial rate). Reference source: Bonbast or TGJU for Rial rates. Ensure accuracy for London Brent Oil in USD.",
        config: { 
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 15000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tether: { type: Type.STRING },
              usd: { type: Type.STRING },
              eur: { type: Type.STRING },
              gbp: { type: Type.STRING },
              aed: { type: Type.STRING },
              gold18: { type: Type.STRING },
              emami: { type: Type.STRING },
              silver: { type: Type.STRING },
              oil: { type: Type.STRING },
            },
            required: ["tether", "usd", "eur", "gbp", "aed", "gold18", "emami", "silver", "oil"]
          }
        },
      });

      const coinJson = await cryptoPromise;
      
      // Clean up text for potential markdown blocks
      let rawText = response.text || "{}";
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultJson = JSON.parse(rawText);

      const cleanNum = (val: any) => {
        if (!val) return '0';
        const str = String(val).replace(/[^\d.]/g, '');
        return str || '0';
      };

      const mappedCoins: CoinData[] = [
        { id: 'bitcoin', symbol: 'BTC', name: 'بیت‌کوین', price: coinJson.bitcoin.usd },
        { id: 'ethereum', symbol: 'ETH', name: 'اتریوم', price: coinJson.ethereum.usd },
        { id: 'solana', symbol: 'SOL', name: 'سولانا', price: coinJson.solana.usd },
        { id: 'binancecoin', symbol: 'BNB', name: 'بایننس‌کوین', price: coinJson.binancecoin.usd },
        { id: 'tether', symbol: 'USDT', name: 'تتر (جهانی)', price: coinJson.tether.usd },
      ];

      const mappedFiats: FiatData[] = [
        { id: 'usd', name: 'دلار آمریکا (آزاد)', symbol: 'USD', price: cleanNum(resultJson.usd) },
        { id: 'eur', name: 'یورو', symbol: 'EUR', price: cleanNum(resultJson.eur) },
        { id: 'gbp', name: 'پوند انگلیس', symbol: 'GBP', price: cleanNum(resultJson.gbp) },
        { id: 'aed', name: 'درهم امارات', symbol: 'AED', price: cleanNum(resultJson.aed) },
        { id: 'usdt_hidden', name: 'تتر داخلی', symbol: 'USDT', price: cleanNum(resultJson.tether) },
      ];

      const mappedMetals: MetalData[] = [
        { id: 'gold18', name: 'طلای ۱۸ عیار', unit: 'گرم', price: cleanNum(resultJson.gold18) },
        { id: 'coin_emami', name: 'سکه امامی', unit: 'عدد', price: cleanNum(resultJson.emami) },
        { id: 'silver', name: 'نقره خام', unit: 'گرم', price: cleanNum(resultJson.silver) },
        { id: 'oil', name: 'نفت برنت', unit: 'بشکه (دلار)', price: cleanNum(resultJson.oil) },
      ];

      let newSources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        newSources = chunks
          .filter(c => c.web)
          .map(c => ({ title: c.web?.title || 'مرکز داده SHΞN™', uri: c.web?.uri || '#' }));
      }

      setMarketData({
        coins: mappedCoins,
        fiats: mappedFiats,
        metals: mappedMetals,
        lastUpdated: new Date(),
        sources: newSources,
        isFetching: false
      });
    } catch (e) {
      console.error("SHΞN™ Engine Critical Failure:", e);
      setMarketData(prev => ({ ...prev, isFetching: false }));
    }
  }, []);

  useEffect(() => {
    if (!marketData.lastUpdated) fetchFinancialData();
    const interval = setInterval(() => {
      fetchFinancialData();
    }, 900000); // 15 minutes
    return () => clearInterval(interval);
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
                 {marketData.isFetching ? 'Rotating Keys...' : 'Market Core: Online'}
               </span>
            </div>
          </div>
        </div>
      </header>

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
                <div className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-600/20 animate-in fade-in zoom-in-95 duration-300"></div>
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
        {activeTab === 'market' && (
          <MarketDashboard 
            data={marketData} 
            onRefresh={fetchFinancialData} 
          />
        )}
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