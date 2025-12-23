import React, { useEffect, useRef, memo } from 'react';

export const TradingViewWidget: React.FC = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && !container.current.querySelector('script')) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-ticker.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbol": "BINANCE:SOLUSDT",
        "width": "100%",
        "isTransparent": true,
        "colorTheme": "light",
        "locale": "fa_IR"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container mb-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';