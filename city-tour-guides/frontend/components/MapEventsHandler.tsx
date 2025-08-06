import { useMapEvents } from 'react-leaflet'

interface MapEventsHandlerProps {
  onMapClick: (lat: number, lng: number) => void
  isAddingPoint: boolean
}

export default function MapEventsHandler({ onMapClick, isAddingPoint }: MapEventsHandlerProps) {
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
