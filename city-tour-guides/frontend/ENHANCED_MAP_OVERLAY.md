# Enhanced Map Display with Hand-drawn Canvas Overlay

## Overview

The enhanced map display feature combines hand-drawn artistic maps with interactive geographic maps, allowing users to view both representations simultaneously as an overlay or switch between different view modes.

## New Components

### 1. EnhancedMapDisplay.tsx
- **Purpose**: Core Leaflet map component with hand-drawn canvas overlay capability
- **Features**:
  - Shows hand-drawn canvas as an overlay on geographic map tile layer
  - Maintains full interactivity with points and routes
  - Adjustable overlay opacity
  - Toggle overlay on/off
  - Points remain clickable even with overlay active

### 2. EnhancedMapWithOverlay.tsx
- **Purpose**: Wrapper component providing view mode switching UI
- **Features**:
  - Three view modes:
    - 🗺️ **Geographic**: Standard interactive map with points and routes
    - 🎨 **Hand-drawn**: Pure artistic canvas view
    - 🔄 **Overlay**: Combined view with hand-drawn overlay on geographic map
  - Overlay opacity controls
  - View statistics and descriptions

## Key Features

### View Modes

1. **Geographic Mode**
   - Standard Leaflet map with OpenStreetMap tiles
   - Interactive markers for points of interest
   - Color-coded routes with popups
   - Full zoom and pan functionality

2. **Hand-drawn Mode**
   - Display pure artistic canvas as created by users
   - Shows strokes, routes, and points from canvas data
   - No geographic correlation, pure artistic view

3. **Overlay Mode** ⭐ **NEW**
   - Hand-drawn canvas overlaid on geographic map
   - Adjustable opacity (0-100%)
   - Geographic points remain fully interactive
   - Hand-drawn elements provide artistic context
   - Best of both worlds - art meets geography

### Interactive Features

- ✅ **Click-through Interactivity**: Points and routes remain clickable even with overlay
- ✅ **Dynamic Opacity Control**: Real-time adjustment of overlay transparency
- ✅ **Toggle On/Off**: Instantly switch overlay visibility
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Performance Optimized**: Canvas rendered only when needed

## Technical Implementation

### Canvas Overlay Process

1. **Canvas Rendering**
   - Parse hand-drawn canvas data (strokes, points, routes)
   - Render to HTML5 canvas element
   - Convert canvas to data URL (base64 image)

2. **Geographic Bounds Calculation**
   - Calculate bounding box of all geographic points
   - Add padding for better visual coverage
   - Map overlay bounds to geographic coordinates

3. **Leaflet ImageOverlay**
   - Use Leaflet's ImageOverlay component
   - Position image over calculated bounds
   - Apply opacity settings
   - Ensure points render above overlay (z-index)

### Data Structure

The overlay system uses existing data structures:

```javascript
// Hand-drawn canvas data
{
  "drawing": {
    "strokes": [{ points: [...], color: "#333", width: 2 }]
  },
  "points": [{ x, y, type, name, description }],
  "routes": [{ points: [...], color, type, name }]
}

// Geographic data
MapPoint: { latitude, longitude, name, description, ... }
MapRoute: { route_coordinates: "[{lat,lng}...]", ... }
```

## Usage

### In Map Detail Pages

```tsx
import EnhancedMapWithOverlay from '@/components/EnhancedMapWithOverlay'

<EnhancedMapWithOverlay
  points={map.points}
  routes={map.routes}
  canvas={map.canvas}
  height="500px"
/>
```

### Direct Enhanced Map

```tsx
import EnhancedMapDisplay from '@/components/EnhancedMapDisplay'

<EnhancedMapDisplay
  points={points}
  routes={routes}
  canvas={canvas}
  showHandDrawnOverlay={true}
  overlayOpacity={0.7}
/>
```

## User Experience

### Benefits

1. **Creative Context**: Hand-drawn maps provide artistic and personal context
2. **Geographic Accuracy**: Real coordinates ensure accurate navigation
3. **Full Interactivity**: All features remain functional with overlay
4. **Visual Appeal**: Combines artistic creativity with functional mapping
5. **Flexible Viewing**: Users choose their preferred view mode

### Use Cases

- **Travel Planning**: See artistic interpretation while getting real coordinates
- **Cultural Tours**: Artistic maps show character while maintaining navigation
- **Educational Maps**: Combine hand-drawn illustrations with factual data
- **Creative Projects**: Artists can overlay their work on real geography

## Performance Considerations

- Canvas rendering cached as data URL
- Overlay only rendered when requested
- Dynamic imports prevent SSR issues
- Efficient re-rendering with React hooks

## Future Enhancements

- [ ] Save user preferences for view mode
- [ ] Blend modes for different overlay effects
- [ ] Multiple canvas layers
- [ ] Animation between view modes
- [ ] Touch gestures for mobile opacity control
- [ ] Synchronize zoom/pan between modes
