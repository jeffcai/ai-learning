'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

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

interface HandDrawnMapCanvasProps {
  canvasData: string
  onCanvasDataChange: (data: string) => void
  points: MapPoint[]
  routes: MapRoute[]
  currentRoute: RoutePoint[]
  selectedTool: 'pen' | 'point' | 'route'
  selectedPointType: MapPoint['type']
  selectedRouteType: MapRoute['type']
  isDrawingRoute: boolean
  onToolChange: (tool: 'pen' | 'point' | 'route') => void
  onPointTypeChange: (type: MapPoint['type']) => void
  onRouteTypeChange: (type: MapRoute['type']) => void
  onAddPoint: (point: Omit<MapPoint, 'id'>) => void
  onAddRoutePoint: (point: RoutePoint) => void
  onStartRoute: () => void
  onFinishRoute: (name: string) => void
  onCancelRoute: () => void
}

export default function HandDrawnMapCanvas({
  canvasData,
  onCanvasDataChange,
  points,
  routes,
  currentRoute,
  selectedTool,
  selectedPointType,
  selectedRouteType,
  isDrawingRoute,
  onToolChange,
  onPointTypeChange,
  onRouteTypeChange,
  onAddPoint,
  onAddRoutePoint,
  onStartRoute,
  onFinishRoute,
  onCancelRoute
}: HandDrawnMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showPointModal, setShowPointModal] = useState(false)
  const [pointPosition, setPointPosition] = useState({ x: 0, y: 0 })
  const [pointName, setPointName] = useState('')
  const [pointDescription, setPointDescription] = useState('')
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [routeName, setRouteName] = useState('')

  const canvasWidth = 800
  const canvasHeight = 600

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Set background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Load existing drawing data if available
    if (canvasData) {
      try {
        const parsedData = JSON.parse(canvasData)
        if (parsedData.drawing) {
          drawFromData(ctx, parsedData.drawing)
        }
      } catch (e) {
        console.error('Error parsing canvas data:', e)
      }
    }

    // Draw existing routes
    routes.forEach(route => {
      drawRoute(ctx, route.points, route.color, false)
    })

    // Draw current route being created
    if (currentRoute.length > 0) {
      drawRoute(ctx, currentRoute, '#FF9800', true)
    }

    // Draw points
    points.forEach(point => {
      drawPoint(ctx, point)
    })
  }, [canvasData, points, routes, currentRoute])

  const drawFromData = (ctx: CanvasRenderingContext2D, drawingData: any) => {
    if (drawingData.strokes) {
      drawingData.strokes.forEach((stroke: any) => {
        if (stroke.points && stroke.points.length > 1) {
          ctx.beginPath()
          ctx.strokeStyle = stroke.color || '#333'
          ctx.lineWidth = stroke.width || 2
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
          stroke.points.forEach((point: any) => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
        }
      })
    }
  }

  const drawRoute = (ctx: CanvasRenderingContext2D, routePoints: RoutePoint[], color: string, isDashed: boolean) => {
    if (routePoints.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (isDashed) {
      ctx.setLineDash([10, 5])
    } else {
      ctx.setLineDash([])
    }

    ctx.moveTo(routePoints[0].x, routePoints[0].y)
    routePoints.forEach(point => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Draw route points
    routePoints.forEach((point, index) => {
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(point.x, point.y, index === 0 || index === routePoints.length - 1 ? 6 : 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawPoint = (ctx: CanvasRenderingContext2D, point: MapPoint) => {
    const icon = getPointIcon(point.type)
    const color = getPointColor(point.type)

    // Draw point background
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
    ctx.fill()

    // Draw white border
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw icon text
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon, point.x, point.y)

    // Draw point name
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(point.name, point.x, point.y + 25)
  }

  const getPointIcon = (type: MapPoint['type']): string => {
    const icons = {
      cafe: '☕',
      restaurant: '🍽️',
      landmark: '🏛️',
      viewpoint: '👁️',
      start: '🚀',
      end: '🏁'
    }
    return icons[type] || '📍'
  }

  const getPointColor = (type: MapPoint['type']): string => {
    const colors = {
      cafe: '#8D6E63',
      restaurant: '#F44336',
      landmark: '#2196F3',
      viewpoint: '#4CAF50',
      start: '#FF9800',
      end: '#9C27B0'
    }
    return colors[type] || '#666'
  }

  const getCanvasPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const pos = getCanvasPos(e)

    if (selectedTool === 'pen') {
      setIsDrawing(true)
      startDrawing(pos)
    } else if (selectedTool === 'point') {
      setPointPosition(pos)
      setShowPointModal(true)
    } else if (selectedTool === 'route') {
      if (!isDrawingRoute) {
        onStartRoute()
      } else {
        onAddRoutePoint(pos)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || selectedTool !== 'pen') return

    const pos = getCanvasPos(e)
    continueDrawing(pos)
  }

  const handleMouseUp = () => {
    if (selectedTool === 'pen') {
      setIsDrawing(false)
      endDrawing()
    }
  }

  const [currentStroke, setCurrentStroke] = useState<any[]>([])

  const startDrawing = (pos: { x: number; y: number }) => {
    setCurrentStroke([pos])
  }

  const continueDrawing = (pos: { x: number; y: number }) => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    setCurrentStroke(prev => {
      const newStroke = [...prev, pos]
      
      // Draw the line segment
      if (newStroke.length > 1) {
        const lastPos = newStroke[newStroke.length - 2]
        ctx.beginPath()
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.moveTo(lastPos.x, lastPos.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }

      return newStroke
    })
  }

  const endDrawing = () => {
    if (currentStroke.length > 1) {
      // Save the stroke data
      const newDrawingData = {
        strokes: [
          ...(canvasData ? JSON.parse(canvasData).drawing?.strokes || [] : []),
          {
            points: currentStroke,
            color: '#333',
            width: 2
          }
        ]
      }

      onCanvasDataChange(JSON.stringify({ drawing: newDrawingData }))
    }
    setCurrentStroke([])
  }

  const handleAddPoint = () => {
    if (!pointName.trim()) return

    onAddPoint({
      name: pointName,
      description: pointDescription,
      type: selectedPointType,
      x: pointPosition.x,
      y: pointPosition.y
    })

    setPointName('')
    setPointDescription('')
    setShowPointModal(false)
  }

  const handleFinishRoute = () => {
    if (!routeName.trim() || currentRoute.length < 2) return

    onFinishRoute(routeName)
    setRouteName('')
    setShowRouteModal(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    onCanvasDataChange('')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Draw Your Map</h2>
      
      {/* Tools */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onToolChange('pen')}
            className={`px-3 py-2 rounded-md ${
              selectedTool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            ✏️ Draw
          </button>
          <button
            onClick={() => onToolChange('point')}
            className={`px-3 py-2 rounded-md ${
              selectedTool === 'point' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📍 Add Point
          </button>
          <button
            onClick={() => onToolChange('route')}
            className={`px-3 py-2 rounded-md ${
              selectedTool === 'route' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            🛤️ Add Route
          </button>
        </div>

        {selectedTool === 'point' && (
          <select
            value={selectedPointType}
            onChange={(e) => onPointTypeChange(e.target.value as MapPoint['type'])}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="landmark">🏛️ Landmark</option>
            <option value="cafe">☕ Cafe</option>
            <option value="restaurant">🍽️ Restaurant</option>
            <option value="viewpoint">👁️ Viewpoint</option>
            <option value="start">🚀 Start</option>
            <option value="end">🏁 End</option>
          </select>
        )}

        {selectedTool === 'route' && (
          <div className="flex space-x-2">
            <select
              value={selectedRouteType}
              onChange={(e) => onRouteTypeChange(e.target.value as MapRoute['type'])}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="walking">🚶 Walking</option>
              <option value="cycling">🚴 Cycling</option>
              <option value="driving">🚗 Driving</option>
            </select>
            
            {isDrawingRoute && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowRouteModal(true)}
                  disabled={currentRoute.length < 2}
                  className="px-3 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                >
                  Finish Route
                </button>
                <button
                  onClick={onCancelRoute}
                  className="px-3 py-2 bg-red-600 text-white rounded-md"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={clearCanvas}
          className="px-3 py-2 bg-red-600 text-white rounded-md"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair block"
          style={{ width: '100%', maxWidth: canvasWidth, height: 'auto' }}
        />
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          {selectedTool === 'pen' && '🖊️ Click and drag to draw on the map'}
          {selectedTool === 'point' && '📍 Click to add points of interest'}
          {selectedTool === 'route' && !isDrawingRoute && '🛤️ Click "Add Route" and then click points to create a route'}
          {selectedTool === 'route' && isDrawingRoute && `🛤️ Click points to add to your ${selectedRouteType} route (${currentRoute.length} points added)`}
        </p>
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
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Local Coffee Shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={pointDescription}
                  onChange={(e) => setPointDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What makes this place special?"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddPoint}
                  disabled={!pointName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Point
                </button>
                <button
                  onClick={() => setShowPointModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Finish Route</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name *
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Historic District Walk"
                />
              </div>

              <div className="text-sm text-gray-600">
                Route type: {selectedRouteType} | Points: {currentRoute.length}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleFinishRoute}
                  disabled={!routeName.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Save Route
                </button>
                <button
                  onClick={() => setShowRouteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
