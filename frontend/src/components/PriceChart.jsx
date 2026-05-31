import { useSignals } from '../hooks/useSignals'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts'
import TooltipUI from './Tooltip'

export default function PriceChart({ ticker }) {
  const { data, loading } = useSignals(ticker)

  if (loading) return null
  if (!data?.chart) return null

  const { dates, close, bb_upper, bb_lower, bb_mid, ema9, ema21 } = data.chart

  const chartData = dates.map((d, i) => ({
    date: d.slice(5),
    Price: close[i],
    'BB Upper': bb_upper[i],
    'BB Lower': bb_lower[i],
    'BB Mid': bb_mid[i],
    'EMA 9': ema9[i],
    'EMA 21': ema21[i],
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <TooltipUI text="Price chart showing Bollinger Bands (grey shading = 2-sigma range) and EMA crossover lines. These are the same indicators used to generate the signal above.">
          <h3 className="text-base font-semibold text-white">Price & Indicators (60 days)</h3>
        </TooltipUI>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={60} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#e5e7eb' }}
            formatter={(v, n) => [v != null ? `$${Number(v).toFixed(2)}` : '—', n]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Line type="monotone" dataKey="BB Upper" stroke="#374151" dot={false} strokeDasharray="4 2" strokeWidth={1} />
          <Line type="monotone" dataKey="BB Lower" stroke="#374151" dot={false} strokeDasharray="4 2" strokeWidth={1} />
          <Line type="monotone" dataKey="BB Mid" stroke="#4b5563" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="EMA 9" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="EMA 21" stroke="#8b5cf6" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="Price" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
