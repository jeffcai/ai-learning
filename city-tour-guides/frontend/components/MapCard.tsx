'use client'

import { Map } from '@/services/api'
import { Star, MapPin, Clock, Download, Heart, Camera } from 'lucide-react'
import Link from 'next/link'

interface MapCardProps {
  map: Map
}

export default function MapCard({ map }: MapCardProps) {
  const getPriceDisplay = () => {
    if (map.price_type === 'free') {
      return 'Free'
    } else if (map.price_type === 'premium') {
      return `$${map.price}`
    } else {
      return 'Custom Pricing'
    }
  }

  const getMapTypeIcon = () => {
    switch (map.map_type) {
      case 'hand_drawn':
        return '✏️'
      case 'digital':
        return '💻'
      case 'hybrid':
        return '🎨'
      default:
        return '🗺️'
    }
  }

  const getCategoryIcon = () => {
    switch (map.category) {
      case 'cafe':
        return '☕'
      case 'cultural':
        return '🏛️'
      case 'museum':
        return '🖼️'
      case 'hiking':
        return '🥾'
      default:
        return '📍'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Map Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {map.thumbnail_url ? (
          <img
            src={map.thumbnail_url}
            alt={map.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getMapTypeIcon()}
          </div>
        )}
        
        {/* Featured Badge */}
        {map.is_featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            ⭐ Featured
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
          {getPriceDisplay()}
        </div>
        
        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getCategoryIcon()}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {map.category}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{map.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {map.title}
        </h3>

        {/* Location */}
        <div className="flex items-center space-x-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{map.city}, {map.country}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {map.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          {map.estimated_duration && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{map.estimated_duration}</span>
            </div>
          )}
          
          {map.difficulty_level && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium">Difficulty:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                map.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                map.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {map.difficulty_level}
              </span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>by {map.creator_name || 'Anonymous'}</span>
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{map.download_count.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/maps/${map.id}`}>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View Map Details
          </button>
        </Link>
      </div>
    </div>
  )
}
