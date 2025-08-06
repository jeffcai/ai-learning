'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

interface FilterProps {
  onFilterChange: (filters: {
    city: string
    country: string
    min_rating: string
    max_price: string
    language: string
    page: number
  }) => void
}

export default function SearchFilters({ onFilterChange }: FilterProps) {
  const [filters, setFilters] = useState({
    city: '',
    country: '',
    min_rating: '',
    max_price: '',
    language: '',
    page: 1
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      country: '',
      min_rating: '',
      max_price: '',
      language: '',
      page: 1
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search Tour Guides
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Filter className="w-4 h-4 mr-1" />
          {showAdvanced ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            value={filters.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="e.g., Paris, Rome, Tokyo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            value={filters.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="e.g., France, Italy, Japan"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={filters.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          >
            <option value="">Any Language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Italian">Italian</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Mandarin">Mandarin</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Russian">Russian</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="min_rating" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                id="min_rating"
                value={filters.min_rating}
                onChange={(e) => handleInputChange('min_rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Price (per hour)
              </label>
              <select
                id="max_price"
                value={filters.max_price}
                onChange={(e) => handleInputChange('max_price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              >
                <option value="">Any Price</option>
                <option value="30">Under $30</option>
                <option value="50">Under $50</option>
                <option value="75">Under $75</option>
                <option value="100">Under $100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {(filters.city || filters.country || filters.language || filters.min_rating || filters.max_price) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
