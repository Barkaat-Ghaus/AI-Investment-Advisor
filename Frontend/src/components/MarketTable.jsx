import React, { useState } from 'react';

const STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation',  price: '$726.13', change: '+4.28%', positive: true  },
  { symbol: 'AAPL', name: 'Apple Inc.',           price: '$182.31', change: '+1.12%', positive: true  },
  { symbol: 'TSLA', name: 'Tesla, Inc.',          price: '$193.57', change: '+2.54%', positive: true  },
  { symbol: 'MSFT', name: 'Microsoft Corporation',price: '$415.90', change: '+0.87%', positive: true  },
  { symbol: 'GOOGL',name: 'Alphabet Inc.',        price: '$174.58', change: '-0.43%', positive: false },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.',     price: '$190.40', change: '+1.75%', positive: true  },
];

const SYMBOL_COLORS = {
  NVDA:  '#0d1f3d',
  AAPL:  '#374151',
  TSLA:  '#1e3a5f',
  MSFT:  '#2d4a6b',
  GOOGL: '#7c3aed',
  AMZN:  '#0f5132',
};

export default function MarketTable() {
  const [watchlist, setWatchlist] = useState([]);

  const toggle = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-[18px]">
        <div className="text-[10.5px] font-bold text-[#2a6a3f] tracking-[0.12em] mb-1.5">
          REAL-TIME DATA
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-[#0d1f3d] tracking-tight">
            Market Trends: Top Performing Stocks
          </h2>
          <button
            className="flex items-center gap-1 text-[13px] font-semibold text-[#2a6a3f] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
          >
            View Full Exchange
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Table Head */}
        <div className="grid grid-cols-[100px_1fr_140px_130px_160px] px-6 py-3 border-b border-slate-100">
          {['SYMBOL', 'ASSET NAME', 'CURRENT PRICE', '24H CHANGE', 'ACTION'].map((h) => (
            <div key={h} className="text-[10.5px] font-semibold text-slate-400 tracking-[0.08em]">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {STOCKS.map((stock, i) => {
          const inWatchlist = watchlist.includes(stock.symbol);
          return (
            <div
              key={stock.symbol}
              className={`grid grid-cols-[100px_1fr_140px_130px_160px] px-6 py-4 items-center transition-colors hover:bg-[#fafbfc] ${
                i < STOCKS.length - 1 ? 'border-b border-[#f8fafc]' : ''
              }`}
            >
              {/* Symbol Badge — color is runtime-dynamic, must stay inline */}
              <div>
                <span
                  className="inline-block px-[10px] py-[5px] rounded-[6px] text-white text-[11.5px] font-bold tracking-[0.04em]"
                  style={{ background: SYMBOL_COLORS[stock.symbol] || '#0d1f3d' }}
                >
                  {stock.symbol}
                </span>
              </div>

              {/* Asset Name */}
              <div className="text-[13.5px] font-medium text-[#0d1f3d]">
                {stock.name}
              </div>

              {/* Price */}
              <div className="text-[13.5px] font-semibold text-[#0d1f3d]">
                {stock.price}
              </div>

              {/* Change */}
              <div className={`flex items-center gap-[5px] text-[13px] font-semibold ${stock.positive ? 'text-green-600' : 'text-red-600'}`}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  {stock.positive
                    ? <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>
                    : <><line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" /></>
                  }
                </svg>
                {stock.change}
              </div>

              {/* Action */}
              <div>
                <button
                  onClick={() => toggle(stock.symbol)}
                  className={`px-[14px] py-[7px] text-[12px] font-semibold rounded-[7px] cursor-pointer transition-all whitespace-nowrap border ${
                    inWatchlist
                      ? 'text-[#2a6a3f] bg-[#e8f5ee] border-[#b6dfc5]'
                      : 'text-slate-500 bg-[#f8fafc] border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
