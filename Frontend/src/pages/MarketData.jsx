import React, { useEffect } from 'react';
import useFinanceStore from '../store/financeStore';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Activity } from 'lucide-react';

export default function MarketData() {
  const { topStocksUs, topStocksIndia, isLoading, fetchTopStocks } = useFinanceStore();

  useEffect(() => {
    fetchTopStocks();
  }, [fetchTopStocks]);

  const renderStockCard = (stock) => {
    const formatCurrency = (currency) => {
      switch(currency) {
        case 'INR': return '₹';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return currency ? currency + ' ' : '$';
      }
    };

    return (
      <div 
        key={stock.symbol} 
        className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-slate-800">{stock.symbol}</span>
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stock.changePercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {stock.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>
          <h3 className="text-xs text-slate-500 truncate" title={stock.shortName}>{stock.shortName}</h3>
        </div>
        
        <div className="mt-4">
          <div className="text-2xl font-light text-slate-900">{formatCurrency(stock.currency)}{stock.price?.toFixed(2) || 'N/A'}</div>
          <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stock.change >= 0 ? '+' : ''}{(stock.change || 0).toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="text-slate-800 font-sans w-full p-4 md:p-6 lg:p-8 h-full min-h-[calc(100vh-80px)] overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Market <span className="font-bold">Data</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Real-time performance of top stocks globally</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* India Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">India Markets (NSE/BSE)</h2>
                  <p className="text-slate-500 text-sm">Top performing Indian companies</p>
                </div>
              </div>

              {topStocksIndia?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topStocksIndia.map(renderStockCard)}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                  No tracking data available for Indian markets.
                </div>
              )}
            </section>

            {/* US Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">US Markets (NYSE/NASDAQ)</h2>
                  <p className="text-slate-500 text-sm">Top performing US tech giants</p>
                </div>
              </div>

              {topStocksUs?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topStocksUs.map(renderStockCard)}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                  No tracking data available for US markets.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
