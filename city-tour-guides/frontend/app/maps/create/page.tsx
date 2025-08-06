'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import HandDrawnMapCanvas from '@/components/HandDrawnMapCanvas'
import GeographicMapPointSelector from '@/components/GeographicMapPointSelector'
import { mapsService, CreateMapPoint } from '@/services/api'

interface MapPoint {
  id: string
  name: string
  x: number
  y: number
  type: 'cafe' | 'restaurant' | 'landmark' | 'viewpoint' | 'start' | 'end'
  description?: string
  latitude?: number
  longitude?: number
}

interface RoutePoint {
  x: number
  y: number
}

interface MapRoute {
  id: string
  name: string
  points: RoutePoint[]
  color: string
  type: 'walking' | 'cycling' | 'driving'
  description?: string
}

export default function CreateHandDrawnMapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Map basic info
  const [mapInfo, setMapInfo] = useState({
    title: '',
    description: '',
    city: '',
    country: '',
    category: 'cultural',
    estimated_duration: '',
    creator_name: '',
    tags: ''
  })

  // Canvas and drawing state
  const [canvasData, setCanvasData] = useState<string>('')
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([])
  const [geographicPoints, setGeographicPoints] = useState<CreateMapPoint[]>([])
  const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([])
  const [selectedTool, setSelectedTool] = useState<'pen' | 'point' | 'route'>('pen')
  const [selectedPointType, setSelectedPointType] = useState<MapPoint['type']>('landmark')
  const [selectedRouteType, setSelectedRouteType] = useState<MapRoute['type']>('walking')
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([])
  const [isDrawingRoute, setIsDrawingRoute] = useState(false)
  const [activeTab, setActiveTab] = useState<'canvas' | 'geographic'>('geographic')

  const handleMapInfoChange = (field: string, value: string) => {
    setMapInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleCanvasDataChange = (data: string) => {
    setCanvasData(data)
  }

  const handleAddPoint = (point: Omit<MapPoint, 'id'>) => {
    const newPoint: MapPoint = {
      ...point,
      id: Date.now().toString()
    }
    setMapPoints(prev => [...prev, newPoint])
  }

  const handleRemovePoint = (pointId: string) => {
    setMapPoints(prev => prev.filter(p => p.id !== pointId))
  }

  const handleStartRoute = () => {
    setIsDrawingRoute(true)
    setCurrentRoute([])
  }

  const handleAddRoutePoint = (point: RoutePoint) => {
    if (isDrawingRoute) {
      setCurrentRoute(prev => [...prev, point])
    }
  }

  const handleFinishRoute = (routeName: string) => {
    if (currentRoute.length > 1) {
      const newRoute: MapRoute = {
        id: Date.now().toString(),
        name: routeName,
        points: currentRoute,
        color: getRouteColor(selectedRouteType),
        type: selectedRouteType
      }
      setMapRoutes(prev => [...prev, newRoute])
    }
    setCurrentRoute([])
    setIsDrawingRoute(false)
  }

  const handleCancelRoute = () => {
    setCurrentRoute([])
    setIsDrawingRoute(false)
  }

  const handleRemoveRoute = (routeId: string) => {
    setMapRoutes(prev => prev.filter(r => r.id !== routeId))
  }

  const getRouteColor = (type: MapRoute['type']): string => {
    switch (type) {
      case 'walking': return '#4CAF50'
      case 'cycling': return '#2196F3' 
      case 'driving': return '#FF5722'
      default: return '#4CAF50'
    }
  }

  const handleSaveMap = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate required fields
      if (!mapInfo.title || !mapInfo.city || !mapInfo.country) {
        throw new Error('Please fill in all required fields (title, city, country)')
      }

      if (!canvasData) {
        throw new Error('Please draw something on the canvas')
      }

      // Create the map first
      const mapData = {
        ...mapInfo,
        map_type: 'hand_drawn',
        price_type: 'free',
        price: 0
      }

      const createdMap = await mapsService.createMap(mapData)

      // Save canvas data
      const canvasPayload = {
        canvas_data: JSON.stringify({
          drawing: canvasData,
          points: mapPoints,
          routes: mapRoutes
        }),
        canvas_width: 800,
        canvas_height: 600
      }

      await mapsService.createHandDrawnCanvas(createdMap.id, canvasPayload)

      // Create canvas points in the database
      for (const point of mapPoints) {
        await mapsService.createMapPoint({
          name: point.name,
          description: point.description,
          point_type: point.type,
          latitude: point.latitude || 0,
          longitude: point.longitude || 0,
          city: mapInfo.city,
          country: mapInfo.country,
          canvas_x: point.x,
          canvas_y: point.y,
          created_by: mapInfo.creator_name || 'Anonymous'
        })
      }

      // Create geographic points in the database
      for (const point of geographicPoints) {
        await mapsService.createMapPoint({
          name: point.name,
          description: point.description,
          point_type: point.point_type,
          latitude: point.latitude,
          longitude: point.longitude,
          address: point.address,
          city: point.city || mapInfo.city,
          country: point.country || mapInfo.country,
          canvas_x: point.canvas_x,
          canvas_y: point.canvas_y,
          created_by: point.created_by || mapInfo.creator_name || 'Anonymous'
        })
      }

      // Create routes in the database
      for (const route of mapRoutes) {
        await mapsService.createMapRoute(createdMap.id, {
          name: route.name,
          description: route.description,
          route_type: route.type,
          route_coordinates: JSON.stringify(route.points),
          color_code: route.color
        })
      }

      router.push(`/maps/${createdMap.id}`)
    } catch (err) {
      console.error('Error saving map:', err)
      setError(err instanceof Error ? err.message : 'Failed to save map')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Hand-Drawn Map
            </h1>
            <p className="text-gray-600">
              Draw your own map and add points of interest and routes for others to explore.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Info Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Map Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={mapInfo.title}
                      onChange={(e) => handleMapInfoChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="My Amazing City Map"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={mapInfo.description}
                      onChange={(e) => handleMapInfoChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your map..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={mapInfo.city}
                        onChange={(e) => handleMapInfoChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={mapInfo.country}
                        onChange={(e) => handleMapInfoChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="France"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={mapInfo.category}
                      onChange={(e) => handleMapInfoChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cultural">Cultural</option>
                      <option value="cafe">Cafe Hopping</option>
                      <option value="museum">Museums</option>
                      <option value="hiking">Hiking</option>
                      <option value="shopping">Shopping</option>
                      <option value="nightlife">Nightlife</option>
                      <option value="food">Food & Dining</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      value={mapInfo.creator_name}
                      onChange={(e) => handleMapInfoChange('creator_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={mapInfo.estimated_duration}
                      onChange={(e) => handleMapInfoChange('estimated_duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2-3 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={mapInfo.tags}
                      onChange={(e) => handleMapInfoChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="art, local, hidden gems"
                    />
                  </div>
                </div>

                {/* Points and Routes Lists */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Canvas Points ({mapPoints.length})</h3>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {mapPoints.map(point => (
                      <div key={point.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{point.name} ({point.type})</span>
                        <button
                          onClick={() => handleRemovePoint(point.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">Geographic Points ({geographicPoints.length})</h3>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {geographicPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm">{point.name} ({point.point_type})</span>
                        <span className="text-xs text-gray-500">{point.city}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">Routes ({mapRoutes.length})</h3>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {mapRoutes.map(route => (
                      <div key={route.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{route.name} ({route.type})</span>
                        <button
                          onClick={() => handleRemoveRoute(route.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveMap}
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Map'}
                </button>
              </div>
            </div>

            {/* Drawing Canvas and Geographic Map Tabs */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('geographic')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'geographic'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🗺️ Geographic Map
                    </button>
                    <button
                      onClick={() => setActiveTab('canvas')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'canvas'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🎨 Hand-drawn Canvas
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'geographic' && (
                <GeographicMapPointSelector
                  onPointsChange={setGeographicPoints}
                  selectedCity={mapInfo.city}
                  selectedCountry={mapInfo.country}
                  initialPoints={geographicPoints}
                />
              )}

              {activeTab === 'canvas' && (
                <HandDrawnMapCanvas
                  canvasData={canvasData}
                  onCanvasDataChange={handleCanvasDataChange}
                  points={mapPoints}
                  routes={mapRoutes}
                  currentRoute={currentRoute}
                  selectedTool={selectedTool}
                  selectedPointType={selectedPointType}
                  selectedRouteType={selectedRouteType}
                  isDrawingRoute={isDrawingRoute}
                  onToolChange={setSelectedTool}
                  onPointTypeChange={setSelectedPointType}
                  onRouteTypeChange={setSelectedRouteType}
                  onAddPoint={handleAddPoint}
                  onAddRoutePoint={handleAddRoutePoint}
                  onStartRoute={handleStartRoute}
                  onFinishRoute={handleFinishRoute}
                  onCancelRoute={handleCancelRoute}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
