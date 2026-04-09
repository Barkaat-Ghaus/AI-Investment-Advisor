import React, { useState } from ' react ';

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
    <section style={{ marginTop: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#2a6a3f', letterSpacing: '0.12em', marginBottom: 6 }}>
          REAL-TIME DATA
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0d1f3d', letterSpacing: '-0.02em' }}>
            Market Trends: Top Performing Stocks
          </h2>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#2a6a3f', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            View Full Exchange
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Table Head */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 140px 130px 160px',
          padding: '12px 24px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {['SYMBOL', 'ASSET NAME', 'CURRENT PRICE', '24H CHANGE', 'ACTION'].map((h) => (
            <div key={h} style={{
              fontSize: 10.5, fontWeight: 600,
              color: '#94a3b8', letterSpacing: '0.08em',
            }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {STOCKS.map((stock, i) => {
          const inWatchlist = watchlist.includes(stock.symbol);
          return (
            <div
              key={stock.symbol}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 140px 130px 160px',
                padding: '16px 24px',
                alignItems: 'center',
                borderBottom: i < STOCKS.length - 1 ? '1px solid #f8fafc' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Symbol Badge */}
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: SYMBOL_COLORS[stock.symbol] || '#0d1f3d',
                  color: '#ffffff',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  {stock.symbol}
                </span>
              </div>

              {/* Asset Name */}
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0d1f3d' }}>
                {stock.name}
              </div>

              {/* Price */}
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0d1f3d' }}>
                {stock.price}
              </div>

              {/* Change */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 600,
                color: stock.positive ? '#16a34a' : '#dc2626',
              }}>
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
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: inWatchlist ? '#2a6a3f' : '#64748b',
                    background: inWatchlist ? '#e8f5ee' : '#f8fafc',
                    border: `1px solid ${inWatchlist ? '#b6dfc5' : '#e2e8f0'}`,
                    borderRadius: 7,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => !inWatchlist && (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => !inWatchlist && (e.currentTarget.style.background = '#f8fafc')}
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
