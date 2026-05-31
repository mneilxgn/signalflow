import { useState, useEffect } from 'react'
import axios from 'axios'

export function useSignals(ticker) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    setData(null)
    axios.get(`/api/signals/${ticker}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load signal data.'))
      .finally(() => setLoading(false))
  }, [ticker])

  return { data, loading, error }
}

export function useBacktest(ticker) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    setData(null)
    axios.get(`/api/backtest/${ticker}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load backtest data.'))
      .finally(() => setLoading(false))
  }, [ticker])

  return { data, loading, error }
}
