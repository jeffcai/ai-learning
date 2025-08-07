'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPoint, MapRoute, HandDrawnCanvas } from '@/services/api'
import HandDrawnMapDisplay from './HandDrawnMapDisplay'

// Dynamically import both map components to avoid SSR issues
const MapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

const EnhancedMapDisplay = dynamic(() => import('./EnhancedMapDisplay'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

interface EnhancedMapWithOverlayProps {
  points: MapPoint[]
  routes: MapRoute[]
  canvas?: HandDrawnCanvas
  height?: string
  className?: string
}

export default function EnhancedMapWithOverlay({ 
  points, 
  routes, 
  canvas, 
  height = '500px', 
  className = '' 
}: EnhancedMapWithOverlayProps) {
  const [viewMode, setViewMode] = useState<'interactive' | 'canvas' | 'overlay'>('interactive')
  const [overlayOpacity, setOverlayOpacity] = useState(0.6)

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* View Mode Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Interactive Map</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">View:</span>
            
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                viewMode === 'interactive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🗺️ Geographic
            </button>
            
            {canvas && (
              <>
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    viewMode === 'canvas'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🎨 Hand-drawn
                </button>
                
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    viewMode === 'overlay'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔄 Overlay
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overlay Controls */}
        {viewMode === 'overlay' && canvas && (
          <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              Hand-drawn Overlay Opacity
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                {Math.round(overlayOpacity * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        )}
      </div>

      {/* Map Content */}
      <div className="relative" style={{ height }}>
        {viewMode === 'interactive' && (
          <MapDisplay
            points={points}
            routes={routes}
            height="100%"
            className="h-full"
          />
        )}

        {viewMode === 'canvas' && canvas && (
          <div className="flex items-center justify-center h-full bg-gray-50 p-4">
            <HandDrawnMapDisplay
              canvas={canvas}
              width={canvas.canvas_width}
              height={canvas.canvas_height}
              className="max-w-full max-h-full"
            />
          </div>
        )}

        {viewMode === 'overlay' && canvas && (
          <EnhancedMapDisplay
            points={points}
            routes={routes}
            canvas={canvas}
            height="100%"
            showHandDrawnOverlay={true}
            overlayOpacity={overlayOpacity}
          />
        )}
      </div>

      {/* View Description */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start space-x-2 text-sm">
          {viewMode === 'interactive' && (
            <>
              <span className="text-blue-600 font-medium">🗺️</span>
              <p className="text-gray-600">
                Geographic map showing real-world locations. Click on markers and routes for detailed information.
              </p>
            </>
          )}
          
          {viewMode === 'canvas' && canvas && (
            <>
              <span className="text-purple-600 font-medium">🎨</span>
              <p className="text-gray-600">
                Hand-drawn artistic map with custom illustrations and artistic routes.
              </p>
            </>
          )}
          
          {viewMode === 'overlay' && canvas && (
            <>
              <span className="text-green-600 font-medium">🔄</span>
              <p className="text-gray-600">
                Combined view with hand-drawn artwork overlaid on geographic map. 
                Adjust opacity to balance artistic and geographic elements. Points remain interactive!
              </p>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      {(points.length > 0 || routes.length > 0) && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {points.length > 0 && (
              <span>📍 {points.length} point{points.length !== 1 ? 's' : ''}</span>
            )}
            {routes.length > 0 && (
              <span>🛤️ {routes.length} route{routes.length !== 1 ? 's' : ''}</span>
            )}
            {canvas && (
              <span>🎨 Hand-drawn elements</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
