// Comprehensive mapping of Deriv symbols to human-readable instrument names
export const SYMBOL_NAME_MAP: Record<string, string> = {
  // Volatility Indices
  'R_10': 'Volatility 10 Index',
  'R_25': 'Volatility 25 Index',
  'R_50': 'Volatility 50 Index',
  'R_75': 'Volatility 75 Index',
  'R_100': 'Volatility 100 Index',
  
  // Volatility 1-second Indices
  '1HZ10V': 'Volatility 10 (1s) Index',
  '1HZ25V': 'Volatility 25 (1s) Index',
  '1HZ50V': 'Volatility 50 (1s) Index',
  '1HZ75V': 'Volatility 75 (1s) Index',
  '1HZ100V': 'Volatility 100 (1s) Index',
  
  // Jump Indices
  'JD10': 'Jump 10 Index',
  'JD25': 'Jump 25 Index',
  'JD50': 'Jump 50 Index',
  'JD75': 'Jump 75 Index',
  'JD100': 'Jump 100 Index',
  
  // Synthetics
  'BEAR': 'Bear Market Index',
  'BULL': 'Bull Market Index',
  
  // Stock Indices
  'GDAXI': 'German DAX 40 Index',
  'FTSE': 'FTSE 100 Index',
  'FCHI': 'CAC 40 Index',
  'STOXX50E': 'Stoxx 50 Index',
  'N225': 'Nikkei 225 Index',
  'CCSI': 'China A50 Index',
  'AORD': 'ASX 200 Index',
  'HSI': 'Hang Seng Index',
  
  // Major Forex Pairs
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'USDCAD': 'USD/CAD',
  'AUDUSD': 'AUD/USD',
  'NZDUSD': 'NZD/USD',
  'EURJPY': 'EUR/JPY',
  'GBPJPY': 'GBP/JPY',
  'EURGBP': 'EUR/GBP',
  
  // Commodities
  'XAUUSD': 'Gold (XAU/USD)',
  'XAGUSD': 'Silver (XAG/USD)',
  'WTIUSD': 'Crude Oil (WTI)',
  'BRENTUSD': 'Brent Oil',
  'NATGAS': 'Natural Gas',
  
  // Cryptocurrencies
  'BTC': 'Bitcoin (BTC)',
  'BTCUSD': 'Bitcoin (BTC/USD)',
  'ETH': 'Ethereum (ETH)',
  'ETHUSD': 'Ethereum (ETH/USD)',
  'LTC': 'Litecoin (LTC)',
  'LTCUSD': 'Litecoin (LTC/USD)',
  'XRP': 'XRP',
  'XRPUSD': 'XRP/USD',
  
  // US Stocks (sample)
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com Inc.',
  'GOOGL': 'Alphabet Inc. (Google)',
  'META': 'Meta Platforms',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corporation',
  'JPM': 'JPMorgan Chase',
  'V': 'Visa Inc.',
  'WMT': 'Walmart Inc.',
}

export function getInstrumentName(symbol: string): string {
  // Try direct lookup first
  if (SYMBOL_NAME_MAP[symbol]) {
    return SYMBOL_NAME_MAP[symbol]
  }
  
  // If not found, return the symbol as-is (for manual entries)
  return symbol
}

export function getSymbolFromShortcode(shortcode: string): string {
  if (!shortcode) return 'UNKNOWN'
  
  const parts = shortcode.split('_')
  
  // Known prefixes to remove
  const prefixesToIgnore = [
    'MULTUP', 'MULTDOWN', 'CALL', 'PUT', 'CALLE', 'PUTE',
    'DIGITMATCH', 'DIGITDIFF', 'DIGITODD', 'DIGITEVEN',
    'DIGITOVER', 'DIGITUNDER', 'ASIANU', 'ASIAND',
    'EXPIRYRANGE', 'EXPIRYMISS', 'RANGE', 'UPORDOWN',
    'ONETOUCH', 'NOTOUCH'
  ]
  
  if (parts.length > 0 && prefixesToIgnore.includes(parts[0])) {
    parts.shift()
  }
  
  // Reconstruct symbol
  if (parts.length >= 2 && parts[0] === 'R') {
    return `R_${parts[1]}`
  } else if (parts.length > 0) {
    return parts[0]
  }
  
  return 'UNKNOWN'
}
