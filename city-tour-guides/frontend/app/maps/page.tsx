'use client'

import { useState, useEffect } from 'react'
import { Map, mapsService } from '@/services/api'
import MapCard from '@/components/MapCard'
import MapFilters from '@/components/MapFilters'
import Header from '@/components/Header'

export default function MapsPage() {
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  
  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    map_type: '',
    price_type: '',
    difficulty: '',
    featured_only: false,
    search: ''
  })

  const fetchMaps = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: currentPage,
        per_page: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
        )
      }
      
      const response = await mapsService.getMaps(params)
      setMaps(response.maps)
      setTotalPages(response.total_pages)
      setTotal(response.total)
    } catch (err) {
      console.error('Error fetching maps:', err)
      setError('Failed to load maps. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaps()
  }, [currentPage, filters])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hand-Drawn City Maps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover unique, artistic maps for your next urban adventure. 
            Perfect for Instagram-worthy explorations and local discoveries.
          </p>
          <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-500">
            <span>🎨 Hand-drawn with love</span>
            <span>📱 Instagram-worthy spots</span>
            <span>🗺️ Custom routes included</span>
            <span>✨ AR filters available</span>
          </div>
          
          {/* Create Map Button */}
          <div className="mt-8">
            <a
              href="/maps/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✏️ Create Your Own Map
            </a>
          </div>
        </div>

        {/* Filters */}
        <MapFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Found ${total} maps`}
          </p>
          {filters.featured_only && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              ⭐ Featured Only
            </span>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Maps Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : maps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No maps found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to find more maps.
            </p>
            <button
              onClick={() => {
                setFilters({
                  city: '',
                  category: '',
                  map_type: '',
                  price_type: '',
                  difficulty: '',
                  featured_only: false,
                  search: ''
                })
                setCurrentPage(1)
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {maps.map((map) => (
                <MapCard key={map.id} map={map} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Business CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Map?</h2>
          <p className="text-lg mb-6 opacity-90">
            We create bespoke hand-drawn maps for cafes, museums, hotels, and tourism boards. 
            Perfect for brand differentiation and customer engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Request Custom Map
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              View B2B Portfolio
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
