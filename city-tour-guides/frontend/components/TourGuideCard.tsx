'use client'

import Image from 'next/image'
import { Star, MapPin, Clock, Languages, Mail, Phone } from 'lucide-react'

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
}

interface TourGuideCardProps {
  guide: TourGuide
}

export default function TourGuideCard({ guide }: TourGuideCardProps) {
  const languageList = guide.languages.split(',').map(lang => lang.trim())
  const specialtyList = guide.specialties.split(',').map(spec => spec.trim())
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden animate-fadeIn">
      {/* Profile Image */}
      <div className="relative h-48 bg-gray-200">
        {guide.profile_image_url ? (
          <Image
            src={guide.profile_image_url}
            alt={guide.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {guide.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{guide.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{guide.name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{guide.city}, {guide.country}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{guide.years_experience} years experience</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {guide.description}
        </p>

        {/* Languages */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Languages className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-sm font-medium text-gray-700">Languages</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {languageList.map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Specialties</div>
          <div className="flex flex-wrap gap-1">
            {specialtyList.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
            {specialtyList.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{specialtyList.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-primary-600">
            ${guide.price_per_hour}
            <span className="text-sm font-normal text-gray-600">/hour</span>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex space-x-2">
          <a
            href={`mailto:${guide.contact_email}`}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-1" />
            Email
          </a>
          {guide.contact_phone && (
            <a
              href={`tel:${guide.contact_phone}`}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
