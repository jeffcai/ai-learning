'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { mapsService } from '@/services/api'

interface MapFiltersProps {
  filters: {
    city: string
    category: string
    map_type: string
    price_type: string
    difficulty: string
    featured_only: boolean
    search: string
  }
  onFilterChange: (filters: MapFiltersProps['filters']) => void
}

export default function MapFilters({ filters, onFilterChange }: MapFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [cities, setCities] = useState<{ city: string; country: string; map_count: number }[]>([])
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          mapsService.getCategories(),
          mapsService.getMapCities()
        ])
        setCategories(categoriesData)
        setCities(citiesData)
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ ...filters, search: localSearch })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localSearch])

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      category: '',
      map_type: '',
      price_type: '',
      difficulty: '',
      featured_only: false,
      search: ''
    }
    setLocalSearch('')
    onFilterChange(clearedFilters)
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return typeof value === 'string' && value.trim() !== ''
    if (key === 'featured_only') return value === true
    return value !== ''
  }).length

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search maps by title, description, or tags..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4 border-t border-gray-200">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={`${city.city}-${city.country}`} value={city.city}>
                  {city.city}, {city.country} ({city.map_count})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Map Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Map Type</label>
            <select
              value={filters.map_type}
              onChange={(e) => handleFilterChange('map_type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="hand_drawn">✏️ Hand Drawn</option>
              <option value="digital">💻 Digital</option>
              <option value="hybrid">🎨 Hybrid</option>
            </select>
          </div>

          {/* Price Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <select
              value={filters.price_type}
              onChange={(e) => handleFilterChange('price_type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured_only}
                onChange={(e) => handleFilterChange('featured_only', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured only</span>
            </label>
          </div>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Category: {filters.category}
            <button
              onClick={() => handleFilterChange('category', '')}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        
        {filters.city && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            City: {filters.city}
            <button
              onClick={() => handleFilterChange('city', '')}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        
        {filters.price_type && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Price: {filters.price_type}
            <button
              onClick={() => handleFilterChange('price_type', '')}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {filters.featured_only && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⭐ Featured
            <button
              onClick={() => handleFilterChange('featured_only', false)}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  )
}
