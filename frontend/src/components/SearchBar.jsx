import { useState } from 'react'

export default function SearchBar({ onSearch, large }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value.toUpperCase())}
        placeholder="Enter ticker (e.g. AAPL)"
        className={`flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition ${large ? 'px-5 py-3 text-lg' : 'px-3 py-2 text-sm'}`}
      />
      <button
        type="submit"
        className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition ${large ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'}`}
      >
        Analyze
      </button>
    </form>
  )
}
