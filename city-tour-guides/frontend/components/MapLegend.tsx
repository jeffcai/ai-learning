'use client'

import { MapRoute, MapPoint } from '@/services/api'

interface MapLegendProps {
  routes: MapRoute[]
  points: MapPoint[]
  className?: string
}

export default function MapLegend({ routes, points, className = '' }: MapLegendProps) {
  const pointTypes = Array.from(new Set(points.map(p => p.point_type)))
  const routeTypes = Array.from(new Set(routes.map(r => r.route_type)))

  const getPointTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      cafe: '☕',
      restaurant: '🍽️',
      landmark: '🏛️',
      viewpoint: '🏔️',
      museum: '🖼️',
      park: '🌳',
      shop: '🛍️',
      hotel: '🏨',
      transport: '🚇',
    }
    return iconMap[type] || '📍'
  }

  const getRouteTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      walking: '🚶',
      cycling: '🚴',
      driving: '🚗',
      mixed: '🚌',
    }
    return iconMap[type] || '🗺️'
  }

  if (routes.length === 0 && points.length === 0) return null

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Map Legend</h3>
      
      {/* Routes Legend */}
      {routes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Routes</h4>
          <div className="space-y-2">
            {routes.map((route) => (
              <div key={route.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: route.color_code }}
                />
                <span className="text-sm text-gray-600">
                  {getRouteTypeIcon(route.route_type)} {route.name}
                </span>
                {route.distance_km && (
                  <span className="text-xs text-gray-500">
                    ({route.distance_km}km)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Types Legend */}
      {routeTypes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Route Types</h4>
          <div className="space-y-1">
            {routeTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <span className="text-sm">{getRouteTypeIcon(type)}</span>
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                {type === 'walking' && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-gray-400 rounded" />
                    <div className="w-1 h-0.5 bg-gray-400 rounded" />
                    <span className="text-xs text-gray-500">(dashed)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Legend */}
      {points.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Points of Interest</h4>
          <div className="space-y-1">
            {pointTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <span className="text-sm">{getPointTypeIcon(type)}</span>
                <span className="text-sm text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Legend */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Special Features */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Special Features</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
              <span className="text-xs text-white">📸</span>
            </div>
            <span className="text-sm text-gray-600">Instagram Worthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">🥽</span>
            <span className="text-sm text-gray-600">AR Content Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
