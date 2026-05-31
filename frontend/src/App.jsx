import { useState } from 'react'
import SearchBar from './components/SearchBar'
import SignalDashboard from './components/SignalDashboard'
import BacktestPanel from './components/BacktestPanel'
import PriceChart from './components/PriceChart'
import SignalHistory from './components/SignalHistory'
import Tooltip from './components/Tooltip'

export default function App() {
  const [ticker, setTicker] = useState('')
  const [activeTicker, setActiveTicker] = useState(null)

  function handleSearch(t) {
    setActiveTicker(t.toUpperCase().trim())
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <span className="text-xl font-bold text-white tracking-tight">SignalFlow</span>
            <span className="hidden sm:inline text-xs text-gray-500 ml-1">Institutional signals for retail investors</span>
          </div>
          <div className="flex-1 max-w-sm ml-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!activeTicker ? (
          <Hero onSearch={handleSearch} />
        ) : (
          <div className="space-y-8">
            <SignalDashboard ticker={activeTicker} />
            <PriceChart ticker={activeTicker} />
            <BacktestPanel ticker={activeTicker} />
            <SignalHistory ticker={activeTicker} />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-16 py-6 text-center text-gray-600 text-sm">
        SignalFlow is for educational purposes only. Not financial advice. Past performance does not guarantee future results.
      </footer>
    </div>
  )
}

function Hero({ onSearch }) {
  const examples = ['AAPL', 'TSLA', 'NVDA', 'SPY', 'MSFT']
  return (
    <div className="flex flex-col items-center text-center py-20 gap-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Institutional Signals,<br />
          <span className="text-blue-400">Retail Friendly</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Enter any stock ticker to get momentum and mean-reversion signals used by hedge funds — explained in plain English.
        </p>
      </div>
      <div className="w-full max-w-md">
        <SearchBar onSearch={onSearch} large />
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        <span className="text-gray-500">Try:</span>
        {examples.map(t => (
          <button
            key={t}
            onClick={() => onSearch(t)}
            className="px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-left max-w-3xl w-full">
        {[
          { icon: '🎯', title: 'RSI Signal', desc: 'Detects when stocks are oversold or overbought using 14-period Relative Strength Index.' },
          { icon: '📊', title: 'Bollinger Bands', desc: 'Flags mean-reversion opportunities when price touches statistical price boundaries.' },
          { icon: '⚡', title: 'EMA Crossover', desc: 'Catches momentum entries when the 9-day EMA crosses the 21-day EMA.' },
        ].map(f => (
          <div key={f.title} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="font-semibold text-white mb-1">{f.title}</div>
            <div className="text-gray-400 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
