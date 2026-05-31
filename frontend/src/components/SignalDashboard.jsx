import { useSignals } from '../hooks/useSignals'
import Tooltip from './Tooltip'

const SIGNAL_COLORS = {
  BUY: 'text-green-400 border-green-500/40 bg-green-500/10',
  SELL: 'text-red-400 border-red-500/40 bg-red-500/10',
  NEUTRAL: 'text-slate-400 border-slate-500/40 bg-slate-500/10',
}

const SIGNAL_BADGE = {
  BUY: 'bg-green-500/20 text-green-400 border border-green-500/30',
  SELL: 'bg-red-500/20 text-red-400 border border-red-500/30',
  NEUTRAL: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
}

const TOOLTIPS = {
  rsi: 'Relative Strength Index (RSI) measures how fast a stock\'s price is moving. Below 30 = oversold (potential buy). Above 70 = overbought (potential sell). Between 30–70 = neutral.',
  bollinger: 'Bollinger Bands are price channels set 2 standard deviations above and below the 20-day average. Touching the lower band suggests the stock may bounce back up (mean reversion).',
  ema: 'Exponential Moving Averages (EMA) weight recent prices more. When the faster 9-day EMA crosses above the slower 21-day EMA, it signals growing upward momentum.',
  confidence: 'Confidence score reflects how many of our 3 signals agree. All 3 aligned = 100%, 2 aligned = 67%, 1 aligned = 33%.',
  signal: 'The combined signal aggregates RSI, Bollinger Bands, and EMA crossover. BUY means at least 2 of 3 indicators suggest a buying opportunity.',
}

export default function SignalDashboard({ ticker }) {
  const { data, loading, error } = useSignals(ticker)

  if (loading) return <LoadingCard label="Loading signals…" />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { signal, confidence, reasons, indicators, individual_signals, price } = data

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-white">{ticker}</h2>
        <span className="text-gray-400 text-lg">${price.toLocaleString()}</span>
        <span className="text-gray-600 text-sm">· Live signals</span>
      </div>

      {/* Main signal card */}
      <div className={`rounded-2xl border p-6 ${SIGNAL_COLORS[signal]}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Tooltip text={TOOLTIPS.signal}>
                <span className="text-sm text-gray-400 font-medium">Combined Signal</span>
              </Tooltip>
            </div>
            <div className="text-5xl font-black tracking-tight">{signal}</div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <Tooltip text={TOOLTIPS.confidence}>
                <span className="text-sm text-gray-400">Confidence</span>
              </Tooltip>
            </div>
            <ConfidenceBar value={confidence} signal={signal} />
            <span className="text-2xl font-bold">{confidence}%</span>
          </div>
        </div>

        {/* Reasons */}
        <div className="mt-5 space-y-2">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="mt-0.5 flex-shrink-0">→</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual signal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <IndividualSignal
          label="RSI (14)"
          signal={individual_signals.rsi}
          value={`${indicators.rsi}`}
          unit=""
          tooltip={TOOLTIPS.rsi}
          detail={indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral zone'}
        />
        <IndividualSignal
          label="Bollinger Position"
          signal={individual_signals.bollinger}
          value={`${indicators.bb_pct}%`}
          unit=""
          tooltip={TOOLTIPS.bollinger}
          detail={`Band: $${indicators.bb_lower} – $${indicators.bb_upper}`}
        />
        <IndividualSignal
          label="EMA Crossover"
          signal={individual_signals.ema}
          value={`9-EMA $${indicators.ema9}`}
          unit=""
          tooltip={TOOLTIPS.ema}
          detail={`21-EMA $${indicators.ema21}`}
        />
      </div>
    </div>
  )
}

function IndividualSignal({ label, signal, value, tooltip, detail }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Tooltip text={tooltip}>
          <span className="text-sm text-gray-400 font-medium">{label}</span>
        </Tooltip>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SIGNAL_BADGE[signal]}`}>{signal}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{detail}</div>
    </div>
  )
}

function ConfidenceBar({ value, signal }) {
  const color = signal === 'BUY' ? 'bg-green-500' : signal === 'SELL' ? 'bg-red-500' : 'bg-slate-500'
  return (
    <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function LoadingCard({ label }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-gray-400">
      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      {label}
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6 text-red-400">
      {message}
    </div>
  )
}
