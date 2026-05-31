import { useSignals } from '../hooks/useSignals'
import TooltipUI from './Tooltip'

const BADGE = {
  BUY: 'bg-green-500/15 text-green-400',
  SELL: 'bg-red-500/15 text-red-400',
  NEUTRAL: 'bg-slate-500/15 text-slate-400',
}

export default function SignalHistory({ ticker }) {
  const { data, loading } = useSignals(ticker)

  if (loading || !data?.history) return null

  const history = [...data.history].reverse()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TooltipUI text="Historical signals from the past 30 trading days. 'Profitable?' checks whether the next day's price moved in the signal's predicted direction — a quick sanity check, not a definitive performance measure.">
          <h3 className="text-base font-semibold text-white">Signal History (30 days)</h3>
        </TooltipUI>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Price</th>
              <th className="pb-2 pr-4 font-medium">Signal</th>
              <th className="pb-2 pr-4 font-medium">RSI</th>
              <th className="pb-2 pr-4 font-medium">Next Day</th>
              <th className="pb-2 font-medium">Profitable?</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="py-2 pr-4 text-gray-400">{row.date}</td>
                <td className="py-2 pr-4 text-white font-mono">${row.price}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE[row.signal]}`}>
                    {row.signal}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span className={`font-mono ${row.rsi < 30 ? 'text-green-400' : row.rsi > 70 ? 'text-red-400' : 'text-gray-400'}`}>
                    {row.rsi}
                  </span>
                </td>
                <td className={`py-2 pr-4 font-mono ${row.next_day_pct > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {row.next_day_pct > 0 ? '+' : ''}{row.next_day_pct}%
                </td>
                <td className="py-2">
                  {row.profitable === null ? (
                    <span className="text-gray-600">—</span>
                  ) : row.profitable ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
