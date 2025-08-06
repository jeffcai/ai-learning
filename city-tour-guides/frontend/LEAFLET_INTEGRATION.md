# Leaflet Maps Integration

This document explains the Leaflet integration for displaying interactive maps with routes and points based on the backend data model.

## 🗺️ Overview

The Leaflet integration provides interactive maps that display:
- **Map Points**: Cafes, landmarks, viewpoints, etc. with custom icons and popups
- **Routes**: Walking paths, cycling routes, etc. with custom colors and information
- **Interactive Features**: Click markers and routes for detailed information
- **Auto-fitting Bounds**: Map automatically zooms to show all content
- **Responsive Design**: Works on desktop and mobile devices

## 📁 File Structure

```
frontend/
├── components/
│   ├── MapDisplay.tsx      # Main Leaflet map component
│   └── MapLegend.tsx       # Map legend component
├── styles/
│   └── leaflet-custom.css  # Custom Leaflet styles
└── app/maps/[id]/page.tsx  # Map details page with Leaflet integration
```

## 🎯 Key Components

### MapDisplay.tsx
- **Main Component**: Renders the interactive Leaflet map
- **Features**:
  - Custom markers for different point types (cafe ☕, landmark 🏛️, viewpoint 🏔️)
  - Color-coded markers (blue for regular, pink for Instagram-worthy)
  - Priority indicators (red/amber/green dots)
  - Polylines for routes with custom colors
  - Auto-fit bounds to show all content
  - Rich popups with detailed information

### MapLegend.tsx
- **Purpose**: Explains map symbols and features
- **Includes**:
  - Route legend with colors and types
  - Point type explanations
  - Priority level indicators
  - Special feature indicators

### Custom Styling (leaflet-custom.css)
- **Enhanced Popups**: Rounded corners, shadows, better typography
- **Mobile Responsive**: Optimized popup sizes for mobile
- **Control Styling**: Improved zoom controls and attribution

## 📊 Data Structure

### Backend Models Used

**MapPoint**:
```python
- latitude/longitude: Geographic coordinates
- point_type: cafe, landmark, viewpoint, etc.
- icon_type: coffee, camera, temple, etc.
- priority: 1 (high), 2 (medium), 3 (low)
- instagram_worthy: Boolean for special highlighting
- address, opening_hours, contact_info: Additional details
- ar_content_url: Link to AR content
```

**MapRoute**:
```python
- route_coordinates: JSON string of lat/lng points
- route_type: walking, cycling, driving, mixed
- color_code: Hex color for map display (#FF6B6B)
- distance_km, estimated_time: Route metadata
- difficulty: easy, medium, hard
- highlights, tips: Route information
```

### Frontend Data Processing

The MapDisplay component processes backend data:

1. **Points**: Converted to Leaflet markers with custom icons
2. **Routes**: JSON coordinates parsed to polylines
3. **Center**: Calculated as average of all point coordinates
4. **Bounds**: Automatically fit to show all content

## 🎨 Visual Features

### Custom Icons
- **Point Types**: Each point type gets a unique emoji icon
- **Priority Colors**: 
  - 🔴 High Priority (red background)
  - 🟡 Medium Priority (amber background)  
  - 🟢 Low Priority (green background)
- **Instagram Worthy**: Pink background with 📸 indicator

### Route Styling
- **Colors**: Custom hex colors from database (`color_code`)
- **Line Styles**: Walking routes use dashed lines
- **Thickness**: 4px width with 80% opacity for visibility

### Interactive Elements
- **Marker Popups**: Rich information including:
  - Name, description, type
  - Address and opening hours
  - Contact information
  - AR content links
  - Priority indicators
- **Route Popups**: Detailed route information:
  - Name, description, type
  - Distance, time, difficulty
  - Highlights and tips

## 📱 Mobile Optimization

- **Responsive Popups**: Max width 250px on mobile
- **Touch Friendly**: Optimized for touch interactions
- **Loading States**: Skeleton loading while map initializes
- **Error Handling**: Graceful fallbacks for data issues

## 🔧 Technical Implementation

### Dynamic Loading
```tsx
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,  // Prevents SSR issues with Leaflet
  loading: () => <LoadingComponent />
})
```

### Data Processing
```tsx
// Parse route coordinates from JSON string
const coordinates = JSON.parse(route.route_coordinates)
const routeLine = coordinates.map(coord => [coord.lat, coord.lng])

// Auto-fit bounds
const bounds = new LatLngBounds([])
points.forEach(point => bounds.extend([point.latitude, point.longitude]))
map.fitBounds(bounds)
```

### Custom Icons
```tsx
const getPointIcon = (point) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}
```

## 🛠️ Setup Requirements

### Dependencies (Already Installed)
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1", 
  "@types/leaflet": "^1.9.20"
}
```

### CSS Imports
```tsx
import 'leaflet/dist/leaflet.css'
import '@/styles/leaflet-custom.css'
```

## 🌟 Features Implemented

✅ **Interactive Points**: Click markers to see detailed information
✅ **Route Visualization**: Color-coded paths with route information  
✅ **Auto-fit Bounds**: Map automatically shows all content
✅ **Custom Icons**: Point type and priority indicators
✅ **Rich Popups**: Comprehensive information display
✅ **Mobile Responsive**: Optimized for all screen sizes
✅ **Loading States**: Smooth loading experience
✅ **Error Handling**: Graceful fallbacks
✅ **Legend Integration**: Clear explanation of map symbols
✅ **Performance Optimized**: Dynamic loading prevents SSR issues

## 🎯 Usage Example

```tsx
// In map details page
<MapDisplay 
  points={map.points} 
  routes={map.routes}
  height="500px"
  className="map-container"
/>

<MapLegend 
  routes={map.routes} 
  points={map.points}
  className="mb-6"
/>
```

## 🔍 Testing

The integration has been tested with:
- **Tokyo Cafe Map**: 3 points, 1 route (2.8km walking trail)
- **Point Types**: cafe, viewpoint, landmark
- **Route Features**: Walking trail with custom color (#FF6B6B)
- **Special Features**: Instagram-worthy locations, AR content links

## 🚀 Live Demo

Visit: `http://localhost:3000/maps/1` to see the Tokyo Cafe Hopping Adventure map with full Leaflet integration.
