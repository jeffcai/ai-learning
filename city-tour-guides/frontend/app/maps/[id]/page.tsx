'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapDetailResponse, mapsService } from '@/services/api'
import MapLegend from '@/components/MapLegend'
import HandDrawnMapDisplay from '@/components/HandDrawnMapDisplay'
import EnhancedMapWithOverlay from '@/components/EnhancedMapWithOverlay'
import '@/styles/leaflet-custom.css'

// Dynamically import MapDisplay to avoid SSR issues with Leaflet
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading interactive map...</p>
      </div>
    </div>
  )
})

export default function MapDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [map, setMap] = useState<MapDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMapDetail = async () => {
      try {
        setLoading(true)
        const mapId = parseInt(params.id as string)
        const mapData = await mapsService.getMap(mapId)
        setMap(mapData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMapDetail()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Map Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/maps')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Maps
          </button>
        </div>
      </div>
    )
  }

  if (!map) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/maps')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Back to Maps
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{map.title}</h1>
              <p className="text-gray-600 mt-2">{map.city}, {map.country}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold text-yellow-400">★</span>
                <span className="ml-1 text-lg font-semibold">{map.rating}</span>
                <span className="ml-1 text-gray-500">({map.reviews.length} reviews)</span>
              </div>
              <p className="text-sm text-gray-500">{map.download_count} downloads</p>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Enhanced Interactive Map with Overlay */}
              <EnhancedMapWithOverlay
                points={map.points} 
                routes={map.routes}
                canvas={map.canvas}
                height="500px"
                className="mb-6"
              />

              {/* Map Image */}
              {map.map_image_url && (
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Hand-drawn Map</h2>
                    <p className="text-sm text-gray-600 mt-1">Original artistic map design</p>
                  </div>
                  <img
                    src={map.map_image_url}
                    alt={map.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">About This Map</h2>
              <p className="text-gray-700 leading-relaxed">{map.description}</p>
              
              {map.tags && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {map.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Points of Interest */}
            {map.points.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Points of Interest ({map.points.length})</h2>
                <div className="space-y-4">
                  {map.points.map((point) => (
                    <div key={point.id} className="border-l-4 border-indigo-500 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{point.name}</h3>
                          <p className="text-gray-600">{point.description}</p>
                          <p className="text-sm text-gray-500 mt-1">{point.address}</p>
                          {point.opening_hours && (
                            <p className="text-sm text-gray-500">Hours: {point.opening_hours}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {point.point_type}
                        </span>
                      </div>
                      {point.instagram_worthy && (
                        <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full mt-2">
                          📸 Instagram Worthy
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Routes */}
            {map.routes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Routes ({map.routes.length})</h2>
                <div className="space-y-4">
                  {map.routes.map((route) => (
                    <div key={route.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{route.name}</h3>
                      <p className="text-gray-600 mb-2">{route.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Distance:</span>
                          <p>{route.distance_km}km</p>
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>
                          <p>{route.estimated_time}</p>
                        </div>
                        <div>
                          <span className="font-medium">Difficulty:</span>
                          <p className="capitalize">{route.difficulty}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="capitalize">{route.route_type}</p>
                        </div>
                      </div>
                      {route.highlights && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Highlights:</span>
                          <p className="text-sm text-gray-600">{route.highlights}</p>
                        </div>
                      )}
                      {route.tips && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Tips:</span>
                          <p className="text-sm text-gray-600">{route.tips}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {map.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Reviews ({map.reviews.length})</h2>
                <div className="space-y-4">
                  {map.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{review.reviewer_name}</h4>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.review_text}</p>
                      {review.visit_date && (
                        <p className="text-sm text-gray-500 mt-2">
                          Visited: {new Date(review.visit_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Map Legend */}
            <MapLegend 
              routes={map.routes} 
              points={map.points}
              className="mb-6"
            />

            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4">Map Details</h3>
              
              {/* Map Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{map.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{map.map_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{map.difficulty_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{map.estimated_duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {map.price_type === 'free' ? 'Free' : `$${map.price}`}
                  </span>
                </div>
                {map.creator_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creator:</span>
                    <span className="font-medium">{map.creator_name}</span>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 font-medium">
                {map.price_type === 'free' ? 'Download Map' : `Purchase for $${map.price}`}
              </button>

              {/* Feature Badge */}
              {map.is_featured && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium text-center">
                    ⭐ Featured Map
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
