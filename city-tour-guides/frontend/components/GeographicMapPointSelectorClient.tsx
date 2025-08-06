'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { CreateMapPoint, CitySearchResult, mapsService, MapPoint } from '@/services/api'

// Import React Leaflet components
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'

interface GeographicMapPointSelectorProps {
  onPointsChange: (points: CreateMapPoint[]) => void
  selectedCity?: string
  selectedCountry?: string
  initialPoints?: CreateMapPoint[]
}

// Map click handler component
function MapClickHandler({ onMapClick, isAddingPoint }: { onMapClick: (lat: number, lng: number) => void, isAddingPoint: boolean }) {
  useMapEvents({
    click: (e) => {
      if (isAddingPoint) {
        const { lat, lng } = e.latlng
        onMapClick(lat, lng)
      }
    }
  })
  return null
}

// Map center update component
function MapCenterUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  
  return null
}

export default function GeographicMapPointSelector({ 
  onPointsChange, 
  selectedCity, 
  selectedCountry,
  initialPoints = []
}: GeographicMapPointSelectorProps) {
  const [points, setPoints] = useState<CreateMapPoint[]>(initialPoints)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]) // Default to NYC
  const [mapZoom, setMapZoom] = useState(13)
  const [isAddingPoint, setIsAddingPoint] = useState(false)
  const [pendingPoint, setPendingPoint] = useState<{ lat: number, lng: number } | null>(null)
  const [showPointModal, setShowPointModal] = useState(false)
  const [pointForm, setPointForm] = useState({
    name: '',
    description: '',
    point_type: 'landmark' as CreateMapPoint['point_type'],
    address: '',
    created_by: ''
  })
  const [citySearch, setCitySearch] = useState('')
  const [cityResults, setCityResults] = useState<CitySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [existingPoints, setExistingPoints] = useState<MapPoint[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<string>('')
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Update points when they change
  useEffect(() => {
    onPointsChange(points)
  }, [points, onPointsChange])

  // Load city coordinates when city/country changes
  useEffect(() => {
    if (selectedCity && selectedCountry) {
      const fullLocationName = `${selectedCity}, ${selectedCountry}`
      setCitySearch(fullLocationName)
      setCurrentLocation(fullLocationName)
      loadCityCoordinates(selectedCity, selectedCountry)
    }
  }, [selectedCity, selectedCountry])

  const loadCityCoordinates = async (city: string, country: string) => {
    if (!city || !country) return
    
    try {
      setLoadingLocation(true)
      setCurrentLocation(`Loading ${city}, ${country}...`)
      
      // Try to get coordinates from Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)},${encodeURIComponent(country)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)]
        setMapCenter(newCenter)
        setMapZoom(13)
        setCurrentLocation(`📍 ${city}, ${country}`)
        
        // Load existing points for this city
        loadExistingPoints(city, country)
      } else {
        setCurrentLocation(`❌ Location not found: ${city}, ${country}`)
      }
    } catch (error) {
      console.error('Error loading city coordinates:', error)
      setCurrentLocation(`❌ Error loading ${city}, ${country}`)
    } finally {
      setLoadingLocation(false)
    }
  }

  const loadExistingPoints = async (city: string, country: string) => {
    try {
      setLoading(true)
      const existingPointsData = await mapsService.getMapPoints({
        city,
        country,
        per_page: 100
      })
      setExistingPoints(existingPointsData)
    } catch (error) {
      console.error('Error loading existing points:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCityResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await mapsService.searchCities(query)
      setCityResults(results.slice(0, 8)) // Increased to 8 results
    } catch (error) {
      console.error('Error searching cities:', error)
      setCityResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleCitySelect = (cityResult: CitySearchResult) => {
    setCitySearch(cityResult.full_name)
    setCityResults([])
    setCurrentLocation(cityResult.full_name)
    loadCityCoordinates(cityResult.city, cityResult.country)
  }

  const handleManualCitySearch = () => {
    const parts = citySearch.split(',').map(part => part.trim())
    if (parts.length >= 2) {
      const city = parts[0]
      const country = parts.slice(1).join(', ')
      loadCityCoordinates(city, country)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setLoadingLocation(true)
    setCurrentLocation('Getting your location...')
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setMapCenter([latitude, longitude])
        setMapZoom(15)
        
        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          if (data && data.display_name) {
            setCurrentLocation(`📍 Your location: ${data.display_name}`)
            setCitySearch(data.display_name)
          } else {
            setCurrentLocation(`📍 Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (error) {
          setCurrentLocation(`📍 Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
        setLoadingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setCurrentLocation('❌ Unable to get your location')
        setLoadingLocation(false)
      }
    )
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAddingPoint) return

    setPendingPoint({ lat, lng })
    setShowPointModal(true)
  }

  const handleAddPoint = () => {
    if (!pendingPoint) return

    const newPoint: CreateMapPoint = {
      name: pointForm.name,
      description: pointForm.description,
      point_type: pointForm.point_type,
      latitude: pendingPoint.lat,
      longitude: pendingPoint.lng,
      address: pointForm.address,
      city: selectedCity || '',
      country: selectedCountry || '',
      created_by: pointForm.created_by || 'Anonymous'
    }

    setPoints(prev => [...prev, newPoint])
    setShowPointModal(false)
    setIsAddingPoint(false)
    setPendingPoint(null)
    setPointForm({
      name: '',
      description: '',
      point_type: 'landmark',
      address: '',
      created_by: ''
    })
  }

  const handleRemovePoint = (index: number) => {
    setPoints(prev => prev.filter((_, i) => i !== index))
  }

  const addExistingPoint = (existingPoint: MapPoint) => {
    // Convert MapPoint to CreateMapPoint
    const createPointData: CreateMapPoint = {
      name: existingPoint.name,
      description: existingPoint.description,
      point_type: existingPoint.point_type,
      latitude: existingPoint.latitude,
      longitude: existingPoint.longitude,
      address: existingPoint.address,
      city: existingPoint.city,
      country: existingPoint.country,
      place_id: existingPoint.place_id,
      opening_hours: existingPoint.opening_hours,
      contact_info: existingPoint.contact_info,
      image_url: existingPoint.image_url,
      icon_type: existingPoint.icon_type,
      priority: existingPoint.priority,
      instagram_worthy: existingPoint.instagram_worthy,
      ar_content_url: existingPoint.ar_content_url,
      canvas_x: existingPoint.canvas_x,
      canvas_y: existingPoint.canvas_y,
      created_by: existingPoint.created_by,
      is_verified: existingPoint.is_verified
    }

    // Check if point already added
    const isAlreadyAdded = points.some(p => 
      p.latitude === createPointData.latitude && 
      p.longitude === createPointData.longitude &&
      p.name === createPointData.name
    )

    if (!isAlreadyAdded) {
      setPoints(prev => [...prev, createPointData])
    }
  }

  const getPointIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      cafe: '☕',
      restaurant: '🍽️',
      landmark: '🏛️',
      viewpoint: '👁️',
      start: '🚀',
      end: '🏁'
    }
    return icons[type] || '📍'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">📍 Geographic Map Points</h2>
      
      {/* Current Location Display */}
      {currentLocation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">Current Location:</span>
            {loadingLocation && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
          </div>
          <p className="text-blue-700 text-sm mt-1">{currentLocation}</p>
        </div>
      )}
      
      {/* Enhanced City Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Search City/Place
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                searchCities(e.target.value)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualCitySearch()
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city name (e.g., Paris, France)..."
            />
            <button
              onClick={handleManualCitySearch}
              disabled={!citySearch || loadingLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingLocation ? '...' : 'Go'}
            </button>
            <button
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Use my current location"
            >
              📍
            </button>
          </div>
          
          {/* Search Results Dropdown */}
          {(cityResults.length > 0 || isSearching) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isSearching && (
                <div className="px-3 py-2 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Searching...
                </div>
              )}
              {cityResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleCitySelect(result)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{result.city}</div>
                  <div className="text-sm text-gray-600">{result.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Type a city name and select from suggestions, or type "City, Country" and press Enter
        </p>
      </div>

      {/* Map Controls */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isAddingPoint 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAddingPoint ? '❌ Cancel Adding' : '📍 Add Point'}
          </button>
          
          {existingPoints.length > 0 && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              {existingPoints.length} existing point{existingPoints.length !== 1 ? 's' : ''} found
            </span>
          )}
          
          {loading && (
            <span className="text-sm text-blue-600 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
              Loading points...
            </span>
          )}
        </div>
        
        {isAddingPoint && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm font-medium">
              🎯 Click anywhere on the map to add a new point of interest
            </p>
            <p className="text-blue-600 text-xs mt-1">
              The point will be added at the coordinates you click on the map
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mb-4 h-96 border border-gray-300 rounded-lg overflow-hidden relative">
        {loadingLocation && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map location...</p>
            </div>
          </div>
        )}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Dynamic map center updater */}
          <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
          
          {/* Map click handler */}
          <MapClickHandler 
            onMapClick={handleMapClick}
            isAddingPoint={isAddingPoint}
          />
          
          {/* User-added points */}
          {points.map((point, index) => (
            <Marker key={`user-${index}`} position={[point.latitude, point.longitude]}>
              <Popup>
                <div>
                  <strong>{point.name}</strong><br />
                  Type: {getPointIcon(point.point_type)} {point.point_type}<br />
                  {point.description && <>{point.description}<br /></>}
                  <button
                    onClick={() => handleRemovePoint(index)}
                    className="mt-2 text-red-600 text-sm hover:underline"
                  >
                    Remove Point
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Existing points (different color) */}
          {existingPoints.map((point, index) => (
            <Marker 
              key={`existing-${point.id}-${index}`} 
              position={[point.latitude, point.longitude]}
            >
              <Popup>
                <div>
                  <strong>{point.name}</strong><br />
                  Type: {getPointIcon(point.point_type)} {point.point_type}<br />
                  {point.description && <>{point.description}<br /></>}
                  {point.address && <>Address: {point.address}<br /></>}
                  <button
                    onClick={() => addExistingPoint(point)}
                    className="mt-2 text-blue-600 text-sm hover:underline"
                  >
                    Add to My Map
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Click Instruction */}
      {isAddingPoint && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            💡 <strong>Click anywhere on the map above to add a point of interest.</strong>
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Note: Due to technical limitations, you can also manually enter coordinates below or drag existing markers.
          </p>
        </div>
      )}

      {/* Manual Coordinates Input (fallback) */}
      {isAddingPoint && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium mb-2">Or enter coordinates manually:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={pendingPoint?.lat || ''}
                onChange={(e) => setPendingPoint(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0, lng: prev?.lng || 0 }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 40.7128"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={pendingPoint?.lng || ''}
                onChange={(e) => setPendingPoint(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0, lat: prev?.lat || 0 }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>
          {pendingPoint && pendingPoint.lat && pendingPoint.lng && (
            <button
              onClick={() => setShowPointModal(true)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Point at {pendingPoint.lat.toFixed(4)}, {pendingPoint.lng.toFixed(4)}
            </button>
          )}
        </div>
      )}

      {/* Selected Points List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Selected Points ({points.length})</h3>
        {points.length === 0 ? (
          <p className="text-gray-500 text-sm">No points selected yet</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {points.map((point, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <div>
                  <span className="font-medium">{point.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {getPointIcon(point.point_type)} {point.point_type}
                  </span>
                  {point.address && (
                    <div className="text-xs text-gray-500">{point.address}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemovePoint(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Point Modal */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Point of Interest</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point Name *
                </label>
                <input
                  type="text"
                  value={pointForm.name}
                  onChange={(e) => setPointForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Local Coffee Shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point Type
                </label>
                <select
                  value={pointForm.point_type}
                  onChange={(e) => setPointForm(prev => ({ ...prev, point_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="landmark">🏛️ Landmark</option>
                  <option value="cafe">☕ Cafe</option>
                  <option value="restaurant">🍽️ Restaurant</option>
                  <option value="viewpoint">👁️ Viewpoint</option>
                  <option value="start">🚀 Start Point</option>
                  <option value="end">🏁 End Point</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={pointForm.description}
                  onChange={(e) => setPointForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What makes this place special?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={pointForm.address}
                  onChange={(e) => setPointForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div className="text-sm text-gray-600">
                Coordinates: {pendingPoint?.lat.toFixed(6)}, {pendingPoint?.lng.toFixed(6)}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddPoint}
                  disabled={!pointForm.name.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Point
                </button>
                <button
                  onClick={() => {
                    setShowPointModal(false)
                    setIsAddingPoint(false)
                    setPendingPoint(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500">
          Loading existing points...
        </div>
      )}
    </div>
  )
}
