'use client'

import { useState, useEffect } from 'react'
import TourGuideCard from '../components/TourGuideCard'
import SearchFilters from '../components/SearchFilters'
import Header from '../components/Header'
import { tourGuideService } from '../services/api'

interface TourGuide {
  id: number
  name: string
  city: string
  country: string
  description: string
  languages: string
  rating: number
  price_per_hour: number
  contact_email: string
  contact_phone?: string
  years_experience: number
  specialties: string
  availability: boolean
  profile_image_url?: string
  created_at: string
  updated_at?: string
}

interface TourGuideList {
  tour_guides: TourGuide[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export default function Home() {
  const [tourGuides, setTourGuides] = useState<TourGuideList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    city: '',
    country: '',
    min_rating: '',
    max_price: '',
    language: '',
    page: 1
  })

  const fetchTourGuides = async () => {
    try {
      setLoading(true)
      const data = await tourGuideService.getTourGuides(filters)
      setTourGuides(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch tour guides. Please try again.')
      console.error('Error fetching tour guides:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTourGuides()
  }, [filters])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  return (
    <main>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Find Your Perfect
            <span className="text-primary-600"> Tour Guide</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing cities with local experts who know all the hidden gems and fascinating stories
          </p>
        </div>

        {/* Search Filters */}
        <SearchFilters onFilterChange={handleFilterChange} />

        {/* Results Section */}
        <div className="mt-12">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchTourGuides}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : tourGuides && tourGuides.tour_guides.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {tourGuides.total} Tour Guide{tourGuides.total !== 1 ? 's' : ''} Found
                </h2>
                <div className="text-sm text-gray-600">
                  Page {tourGuides.page} of {tourGuides.total_pages}
                </div>
              </div>

              {/* Tour Guides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {tourGuides.tour_guides.map((guide) => (
                  <TourGuideCard key={guide.id} guide={guide} />
                ))}
              </div>

              {/* Pagination */}
              {tourGuides.total_pages > 1 && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: tourGuides.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        page === filters.page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === tourGuides.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-gray-600 text-lg mb-4">No tour guides found</p>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
