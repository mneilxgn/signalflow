import { useState } from 'react'

export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs flex items-center justify-center hover:bg-gray-600 transition flex-shrink-0"
        aria-label="More information"
      >
        ?
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 z-50 shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}
