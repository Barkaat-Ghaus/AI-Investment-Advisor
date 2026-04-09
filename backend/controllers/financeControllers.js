import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

export const getTopPerformingStocks = async (req, res) => {
  try {
    const usSymbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD'];
    const indiaSymbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'ITC.NS', 'BHARTIARTL.NS'];
    
    // Fetch quotes for all symbols simultaneously
    const allSymbols = [...usSymbols, ...indiaSymbols];
    const quotes = await yahooFinance.quote(allSymbols);
    
    // Helper to format and sort
    const processQuotes = (symbolsList) => {
      return quotes
        .filter(q => symbolsList.includes(q.symbol))
        .sort((a, b) => (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0))
        .map(q => ({
          symbol: q.symbol,
          shortName: q.shortName || q.longName,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          currency: q.currency,
          type: "bull"
        }))
        .slice(0, 5); // top 5 of each
    };

    const usTopPerformers = processQuotes(usSymbols);
    const indiaTopPerformers = processQuotes(indiaSymbols);

    res.status(200).json({
      us: usTopPerformers,
      india: indiaTopPerformers
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ message: "Failed to fetch top performing stocks" });
  }
};
