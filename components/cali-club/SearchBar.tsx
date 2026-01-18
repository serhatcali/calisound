'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SearchIcon, XIcon } from './Icons'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ placeholder = 'Search...', onSearch, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`relative flex items-center gap-2 px-4 py-2.5 bg-black/80 backdrop-blur-sm rounded-xl border-2 transition-all ${
          isFocused ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-gray-800'
        }`}
      >
        <SearchIcon className="text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
