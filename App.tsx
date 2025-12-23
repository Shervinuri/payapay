import React, { useState, useEffect } from 'react';
import { CountdownTimer } from './components/CountdownTimer';
import { CycleList } from './components/CycleList';
import { InfoCard } from './components/InfoCard';
import { ClockHeader } from './components/ClockHeader';
import { SatnaDashboard } from './components/SatnaDashboard';
import { ChakavakDashboard } from './components/ChakavakDashboard';
import { CryptoDashboard } from './components/CryptoDashboard';
import { calculateNextCycle, calculateTimeRemaining, calculateProgress } from './utils/timeHelpers';
import { Wallet, Activity, Repeat, Zap, FileText, LayoutGrid } from 'lucide-react';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('paya');
  const [calculation, setCalculation] = useState(calculateNextCycle());
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(calculation.targetDate));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(calculateProgress(calculation.targetDate));

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
    { id: 'crypto', label: 'کریپتو', icon: LayoutGrid },
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
               <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Tab Navigation */}
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
        {/* Official Date & Time Header */}
        <ClockHeader />

        {activeTab === 'paya' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CountdownTimer 
              timeRemaining={timeRemaining} 
              nextCycle={calculation.nextCycle}
              isTomorrow={calculation.isTomorrow}
            />
            <CycleList 
              nextCycleId={calculation.nextCycle.id} 
              progress={progress}
            />
            <InfoCard />
          </div>
        )}

        {activeTab === 'satna' && <SatnaDashboard />}
        
        {activeTab === 'chakavak' && <ChakavakDashboard />}

        {activeTab === 'crypto' && <CryptoDashboard />}
      </main>

      <footer className="mt-auto py-10 text-center">
        <div className="text-[14px] font-bold footer-gradient opacity-90">
          <a href="https://T.me/shervini" target="_blank" rel="noopener noreferrer">
            Exclusive SHΞN™ made
          </a>
        </div>
        <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">
          Integrated Financial Settlement Core
        </p>
      </footer>
    </div>
  );
};

export default App;