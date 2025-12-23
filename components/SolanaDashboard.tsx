import React, { useState, useEffect, useCallback } from 'react';
import { TradingViewWidget } from './TradingViewWidget';
import { Wallet, DollarSign, Calculator, RefreshCw, AlertCircle } from 'lucide-react';

const SOL_HOLDINGS = 1.1;

export const SolanaDashboard: React.FC = () => {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [dollarRate, setDollarRate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPrice = useCallback(async () => {
    // Only set loading if we don't have a price yet (initial load)
    // otherwise we just want a background refresh without wiping the UI
    
    const apis = [
      {
        name: 'CoinGecko',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        parse: (data: any) => data.solana?.usd
      },
      {
        name: 'CryptoCompare',
        url: 'https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD',
        parse: (data: any) => data.USD
      },
      {
        name: 'CoinCap',
        url: 'https://api.coincap.io/v2/assets/solana',
        parse: (data: any) => parseFloat(data.data?.priceUsd)
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (!response.ok) continue;
        const data = await response.json();
        const price = api.parse(data);

        if (price && !isNaN(price)) {
          setSolPrice(price);
          setLastUpdated(new Date());
          setLoading(false);
          setError(false);
          return;
        }
      } catch (e) {
        console.warn(`${api.name} failed`, e);
      }
    }

    // If we reach here, all APIs failed
    // Only show error if we don't have a price at all
    setLoading(false);
    // We can keep the old price if we have one, but maybe show a warning icon
    setError(true);
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Formatters
  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat('fa-IR', { 
      style: currency === 'IRR' ? 'decimal' : 'currency', 
      currency: 'USD',
      maximumFractionDigits: currency === 'IRR' ? 0 : 2
    }).format(val);
  };

  const calculateTotalRial = () => {
    if (!solPrice || !dollarRate) return 0;
    const rate = parseFloat(dollarRate.replace(/,/g, '')) || 0;
    return (solPrice * SOL_HOLDINGS * rate);
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
            داشبورد سولانا
        </h2>
        <span className="text-xs text-gray-400 flex items-center gap-1">
            {error && !solPrice ? (
                 <span className="text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    خطا در دریافت قیمت
                </span>
            ) : (
                <span className="flex items-center gap-1">
                     <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                     بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
                     {error && <AlertCircle className="w-3 h-3 text-amber-500 ml-1" />}
                </span>
            )}
        </span>
      </div>

      <TradingViewWidget />

      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-5">
        
        {/* Holdings Section */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-purple-600 block mb-0.5 font-medium">موجودی کیف پول</span>
                    <span className="font-bold text-gray-800 text-lg">{SOL_HOLDINGS} SOL</span>
                </div>
            </div>
            <div className="text-left">
                <span className="text-xs text-gray-400 block mb-0.5">ارزش دلاری</span>
                <span className="font-bold text-gray-900 dir-ltr block">
                    {solPrice 
                        ? `$${formatCurrency(solPrice * SOL_HOLDINGS, 'USD').replace('$', '')}`
                        : '...'
                    }
                </span>
            </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Calculation Section */}
        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                قیمت روز دلار (به ریال)
            </label>
            <div className="relative">
                <input
                    type="number"
                    value={dollarRate}
                    onChange={(e) => setDollarRate(e.target.value)}
                    placeholder="مثلاً ۶۰۰۰۰۰"
                    className="w-full p-3 pl-12 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-bold text-gray-800 placeholder-gray-300 text-left dir-ltr"
                />
                <span className="absolute left-3 top-3.5 text-gray-400 text-sm pointer-events-none">IRR</span>
            </div>
        </div>

        {/* Final Result */}
        <div className="bg-gray-900 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm">ارزش ریالی کل</span>
                </div>
                <div className="text-left">
                    <div className="font-black text-xl tracking-tight">
                        {dollarRate && solPrice 
                            ? formatCurrency(calculateTotalRial(), 'IRR') 
                            : '---'
                        }
                    </div>
                    <div className="text-[10px] text-gray-400 text-right mt-1">ریال ایران</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};