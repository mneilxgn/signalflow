import { useBacktest } from '../hooks/useSignals'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts'
import TooltipUI from './Tooltip'

const TOOLTIPS = {
  totalReturn: 'Total return of the SignalFlow strategy over 2 years, starting with $10,000.',
  bh: 'Buy-and-hold return: what you would have made simply buying and holding the stock for 2 years.',
  sharpe: 'Sharpe Ratio measures return per unit of risk. Above 1.0 is considered good, above 2.0 is excellent. Negative means the strategy underperformed a risk-free investment.',
  drawdown: 'Maximum Drawdown is the largest peak-to-trough drop in portfolio value. Lower is better — a 20% drawdown means your portfolio fell 20% from its high before recovering.',
  winRate: 'Win Rate is the percentage of trades that were profitable. A 50%+ win rate with good trade sizing can still be very profitable.',
}

export default function BacktestPanel({ ticker }) {
  const { data, loading, error } = useBacktest(ticker)

  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-gray-400">
      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Running 2-year backtest…
    </div>
  )
  if (error) return null
  if (!data) return null

  const { total_return_pct, bh_return_pct, sharpe_ratio, max_drawdown_pct, win_rate_pct, total_trades, equity_curve, bh_curve } = data

  const chartData = equity_curve.map((e, i) => ({
    date: e.date.slice(5),
    Strategy: e.value,
    'Buy & Hold': bh_curve[i]?.value,
  }))

  const stratBetter = total_return_pct > bh_return_pct

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-6">
      <div className="flex items-center gap-2">
        <TooltipUI text="Backtesting simulates the strategy on 2 years of historical data. We enter on a BUY signal (2+ indicators agree) and exit on a SELL signal. Starting capital: $10,000.">
          <h3 className="text-base font-semibold text-white">2-Year Backtest Results</h3>
        </TooltipUI>
        {stratBetter ? (
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Beats buy & hold</span>
        ) : (
          <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">Trails buy & hold</span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Stat label="Strategy Return" value={`${total_return_pct > 0 ? '+' : ''}${total_return_pct}%`} positive={total_return_pct > 0} tooltip={TOOLTIPS.totalReturn} />
        <Stat label="Buy & Hold" value={`${bh_return_pct > 0 ? '+' : ''}${bh_return_pct}%`} positive={bh_return_pct > 0} tooltip={TOOLTIPS.bh} />
        <Stat label="Sharpe Ratio" value={sharpe_ratio} positive={sharpe_ratio > 1} tooltip={TOOLTIPS.sharpe} />
        <Stat label="Max Drawdown" value={`-${max_drawdown_pct}%`} positive={false} tooltip={TOOLTIPS.drawdown} />
        <Stat label="Win Rate" value={`${win_rate_pct}%`} positive={win_rate_pct >= 50} tooltip={TOOLTIPS.winRate} sub={`${total_trades} trades`} />
      </div>

      {/* Equity curve */}
      <div>
        <p className="text-xs text-gray-500 mb-3">Portfolio value starting at $10,000</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={70} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v, n) => [v != null ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—', n]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="Strategy" stroke="#3b82f6" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Buy & Hold" stroke="#6b7280" dot={false} strokeWidth={1.5} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Stat({ label, value, positive, tooltip, sub }) {
  return (
    <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
      <TooltipUI text={tooltip}>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
      </TooltipUI>
      <div className={`text-xl font-bold ${positive ? 'text-green-400' : 'text-red-400'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}
