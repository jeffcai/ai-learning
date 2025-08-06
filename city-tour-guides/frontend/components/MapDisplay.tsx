'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapPoint, MapRoute } from '@/services/api'
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

interface MapDisplayProps {
  points: MapPoint[]
  routes: MapRoute[]
  height?: string
  className?: string
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

export default function MapDisplay({ points, routes, height = '400px', className = '' }: MapDisplayProps) {
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
        
        {/* Fit bounds to show all content */}
        <FitBounds points={points} routes={routeLines} />
        
        {/* Render map points */}
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
                  
                  {point.address && (
                    <div className="flex items-start space-x-2">
                      <span className="font-medium">Address:</span>
                      <span>{point.address}</span>
                    </div>
                  )}
                  
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
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Priority:</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPriorityColor(point.priority) }}
                      title={`Priority ${point.priority}`}
                    />
                  </div>
                </div>

                {point.ar_content_url && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <a 
                      href={point.ar_content_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      🥽 View AR Content
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render routes */}
        {routeLines.map((route) => {
          if (!route?.coordinates) return null
          
          return (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              color={route.color_code}
              weight={4}
              opacity={0.8}
              dashArray={route.route_type === 'walking' ? '10, 5' : undefined}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{route.name}</h3>
                  
                  {route.description && (
                    <p className="text-gray-700 text-sm mb-3">{route.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="capitalize">{route.route_type}</p>
                    </div>
                    
                    {route.distance_km && (
                      <div>
                        <span className="font-medium text-gray-600">Distance:</span>
                        <p>{route.distance_km}km</p>
                      </div>
                    )}
                    
                    {route.estimated_time && (
                      <div>
                        <span className="font-medium text-gray-600">Time:</span>
                        <p>{route.estimated_time}</p>
                      </div>
                    )}
                    
                    {route.difficulty && (
                      <div>
                        <span className="font-medium text-gray-600">Difficulty:</span>
                        <p className={`capitalize ${
                          route.difficulty === 'easy' ? 'text-green-600' :
                          route.difficulty === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {route.difficulty}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {route.highlights && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-600 text-xs">Highlights:</span>
                      <p className="text-sm text-gray-700">{route.highlights}</p>
                    </div>
                  )}
                  
                  {route.tips && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-600 text-xs">Tips:</span>
                      <p className="text-sm text-gray-700">{route.tips}</p>
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
