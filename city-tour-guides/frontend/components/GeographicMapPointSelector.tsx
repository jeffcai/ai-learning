'use client'

import dynamic from 'next/dynamic'
import { CreateMapPoint } from '@/services/api'

// Dynamically import the geographic map point selector to avoid SSR issues
const GeographicMapPointSelectorClient = dynamic(
  () => import('./GeographicMapPointSelectorClient'),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div> }
)

interface GeographicMapPointSelectorProps {
  onPointsChange: (points: CreateMapPoint[]) => void
  selectedCity?: string
  selectedCountry?: string
  initialPoints?: CreateMapPoint[]
}

export default function GeographicMapPointSelector(props: GeographicMapPointSelectorProps) {
  return <GeographicMapPointSelectorClient {...props} />
}
