'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ImageOverlay } from 'react-leaflet'
import { Icon, LatLngBounds, LatLng } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPoint, MapRoute, HandDrawnCanvas } from '@/services/api'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface FitBoundsProps {
  points: MapPoint[]
  routes: MapRoute[]
}

// Component to automatically fit map bounds to show all points and routes
function FitBounds({ points, routes }: FitBoundsProps) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0 && routes.length === 0) return

    const bounds = new LatLngBounds([])

    // Add all points to bounds
    points.forEach(point => {
      bounds.extend([point.latitude, point.longitude])
    })

    // Add all route coordinates to bounds
    routes.forEach(route => {
      if (route.route_coordinates) {
        try {
          const coordinates = JSON.parse(route.route_coordinates)
          coordinates.forEach((coord: { lat: number; lng: number }) => {
            bounds.extend([coord.lat, coord.lng])
          })
        } catch (e) {
          console.warn('Invalid route coordinates:', route.route_coordinates)
        }
      }
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, points, routes])

  return null
}

interface HandDrawnOverlayProps {
  canvas: HandDrawnCanvas
  points: MapPoint[]
  opacity: number
}

// Component to render hand-drawn canvas as an overlay on the map
function HandDrawnOverlay({ canvas, points, opacity }: HandDrawnOverlayProps) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [overlayBounds, setOverlayBounds] = useState<[[number, number], [number, number]] | null>(null)

  useEffect(() => {
    if (!canvas || !canvas.canvas_data) return

    const canvasElement = canvasRef.current
    if (!canvasElement) return

    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.canvas_width || 800
    const height = canvas.canvas_height || 600
    canvasElement.width = width
    canvasElement.height = height

    // Clear and set background
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, width, height)

    try {
      const canvasData = JSON.parse(canvas.canvas_data)
      
      // Draw the hand-drawn elements
      if (canvasData.drawing && canvasData.drawing.strokes) {
        canvasData.drawing.strokes.forEach((stroke: any) => {
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

      // Draw canvas routes (from hand-drawn data, not geographic routes)
      if (canvasData.routes) {
        canvasData.routes.forEach((route: any) => {
          if (route.points && route.points.length > 1) {
            ctx.beginPath()
            ctx.strokeStyle = route.color || '#4CAF50'
            ctx.lineWidth = 4
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            
            ctx.moveTo(route.points[0].x, route.points[0].y)
            route.points.forEach((point: any) => {
              ctx.lineTo(point.x, point.y)
            })
            ctx.stroke()
          }
        })
      }

      // Draw canvas points (from hand-drawn data)
      if (canvasData.points) {
        canvasData.points.forEach((point: any) => {
          const icon = getCanvasPointIcon(point.type)
          const color = getCanvasPointColor(point.type)

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

          // Draw icon
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(icon, point.x, point.y)

          // Draw point name
          ctx.fillStyle = '#333'
          ctx.font = '12px Arial'
          ctx.fillText(point.name, point.x, point.y + 25)
        })
      }

      // Convert canvas to data URL
      const dataUrl = canvasElement.toDataURL('image/png')
      setImageDataUrl(dataUrl)

      // Calculate bounds for overlay based on map bounds
      if (points.length > 0) {
        const bounds = new LatLngBounds([])
        points.forEach(point => {
          bounds.extend([point.latitude, point.longitude])
        })
        
        if (bounds.isValid()) {
          const southWest = bounds.getSouthWest()
          const northEast = bounds.getNorthEast()
          
          // Add some padding to make the overlay slightly larger than the points
          const latPadding = (northEast.lat - southWest.lat) * 0.1
          const lngPadding = (northEast.lng - southWest.lng) * 0.1
          
          setOverlayBounds([
            [southWest.lat - latPadding, southWest.lng - lngPadding],
            [northEast.lat + latPadding, northEast.lng + lngPadding]
          ])
        }
      }
    } catch (e) {
      console.error('Error rendering hand-drawn canvas:', e)
    }
  }, [canvas, points])

  // Helper functions for canvas points
  const getCanvasPointIcon = (type: string): string => {
    const icons = {
      cafe: '☕',
      restaurant: '🍽️',
      landmark: '🏛️',
      viewpoint: '👁️',
      start: '🚀',
      end: '🏁'
    }
    return icons[type as keyof typeof icons] || '📍'
  }

  const getCanvasPointColor = (type: string): string => {
    const colors = {
      cafe: '#8B4513',
      restaurant: '#FF6B6B',
      landmark: '#2196F3',
      viewpoint: '#4CAF50',
      start: '#FF9800',
      end: '#9C27B0'
    }
    return colors[type as keyof typeof colors] || '#666'
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageDataUrl && overlayBounds && (
        <ImageOverlay
          url={imageDataUrl}
          bounds={overlayBounds}
          opacity={opacity}
        />
      )}
    </>
  )
}

interface EnhancedMapDisplayProps {
  points: MapPoint[]
  routes: MapRoute[]
  canvas?: HandDrawnCanvas
  height?: string
  className?: string
  showHandDrawnOverlay?: boolean
  overlayOpacity?: number
}

// Get custom icon for different point types
const getPointIcon = (point: MapPoint) => {
  const iconMap: { [key: string]: string } = {
    cafe: 'coffee',
    restaurant: 'utensils',
    landmark: 'monument',
    viewpoint: 'mountain',
    museum: 'building',
    park: 'tree',
    shop: 'shopping-bag',
    hotel: 'bed',
    transport: 'train',
    camera: 'camera',
    temple: 'place-of-worship',
    church: 'church',
    nature: 'leaf',
    coffee: 'coffee',
    mountain: 'mountain',
  }

  const iconType = iconMap[point.icon_type || point.point_type] || 'map-pin'
  const color = point.instagram_worthy ? '#E91E63' : '#3B82F6'
  
  // Create SVG without emojis to avoid btoa Unicode issues
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
      ${point.instagram_worthy ? '<circle cx="20" cy="12" r="3" fill="#FFD700"/>' : ''}
    </svg>
  `
  
  try {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon.trim())}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    })
  } catch (error) {
    console.warn('Error creating custom icon, falling back to default:', error)
    // Fallback to default Leaflet icon
    return new Icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })
  }
}

// Get priority color for points
const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return '#EF4444' // High priority - red
    case 2: return '#F59E0B' // Medium priority - amber
    case 3: return '#10B981' // Low priority - green
    default: return '#3B82F6' // Default - blue
  }
}

export default function EnhancedMapDisplay({ 
  points, 
  routes, 
  canvas, 
  height = '400px', 
  className = '',
  showHandDrawnOverlay = true,
  overlayOpacity = 0.7
}: EnhancedMapDisplayProps) {
  const [localShowOverlay, setLocalShowOverlay] = useState(showHandDrawnOverlay)
  const [localOpacity, setLocalOpacity] = useState(overlayOpacity)

  // Update local state when props change
  useEffect(() => {
    setLocalShowOverlay(showHandDrawnOverlay)
  }, [showHandDrawnOverlay])

  useEffect(() => {
    setLocalOpacity(overlayOpacity)
  }, [overlayOpacity])
  // Calculate center point
  const center = useMemo(() => {
    if (points.length === 0) return [35.6762, 139.6503] as [number, number] // Default to Tokyo

    const avgLat = points.reduce((sum, point) => sum + point.latitude, 0) / points.length
    const avgLng = points.reduce((sum, point) => sum + point.longitude, 0) / points.length
    
    return [avgLat, avgLng] as [number, number]
  }, [points])

  // Parse route coordinates
  const routeLines = useMemo(() => {
    return routes.map(route => {
      if (!route.route_coordinates) return null
      
      try {
        const coordinates = JSON.parse(route.route_coordinates)
        return {
          ...route,
          coordinates: coordinates.map((coord: { lat: number; lng: number }) => [coord.lat, coord.lng] as [number, number])
        }
      } catch (e) {
        console.warn('Invalid route coordinates for route:', route.name)
        return null
      }
    }).filter(Boolean)
  }, [routes])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Overlay Controls */}
      {canvas && (
        <div className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-md p-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={localShowOverlay}
              onChange={(e) => setLocalShowOverlay(e.target.checked)}
              className="rounded"
            />
            <span>Show Hand-drawn Overlay</span>
          </label>
          {localShowOverlay && (
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Opacity: {Math.round(localOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localOpacity}
                onChange={(e) => setLocalOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Hand-drawn Canvas Overlay */}
        {canvas && localShowOverlay && (
          <HandDrawnOverlay
            canvas={canvas}
            points={points}
            opacity={localOpacity}
          />
        )}
        
        {/* Fit bounds to show all content */}
        <FitBounds points={points} routes={routeLines} />
        
        {/* Render map points - these will appear on top of the overlay */}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={getPointIcon(point)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{point.name}</h3>
                  {point.instagram_worthy && (
                    <span className="ml-2 text-pink-500 text-sm">📸</span>
                  )}
                </div>
                
                {point.description && (
                  <p className="text-gray-700 text-sm mb-2">{point.description}</p>
                )}
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                      {point.point_type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Priority:</span>
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(point.priority) }}
                      />
                      <span>
                        {point.priority === 1 ? 'High' : 
                         point.priority === 2 ? 'Medium' : 
                         point.priority === 3 ? 'Low' : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {point.opening_hours && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Hours:</span>
                      <span>{point.opening_hours}</span>
                    </div>
                  )}

                  {point.contact_info && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Contact:</span>
                      <span>{point.contact_info}</span>
                    </div>
                  )}

                  {point.address && (
                    <div className="flex items-start space-x-2">
                      <span className="font-medium">Address:</span>
                      <span>{point.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render routes */}
        {routeLines.map((route) => {
          if (!route || !route.coordinates || route.coordinates.length === 0) return null
          
          // Get route color based on type
          const getRouteColor = (type: string) => {
            switch (type.toLowerCase()) {
              case 'walking': return '#4CAF50'
              case 'cycling': return '#2196F3'
              case 'driving': return '#F44336'
              case 'public_transport': return '#9C27B0'
              default: return '#666666'
            }
          }

          return (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{
                color: getRouteColor(route.route_type),
                weight: 4,
                opacity: 0.8
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm">{route.name}</h3>
                  {route.description && (
                    <p className="text-xs text-gray-700 mt-1">{route.description}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2 text-xs">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                      {route.route_type}
                    </span>
                  </div>
                  {route.estimated_time && (
                    <div className="flex items-center space-x-2 mt-1 text-xs">
                      <span className="font-medium">Duration:</span>
                      <span>{route.estimated_time}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Polyline>
          )
        })}
      </MapContainer>
    </div>
  )
}
