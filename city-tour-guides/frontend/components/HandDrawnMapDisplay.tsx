'use client'

import { useRef, useEffect } from 'react'
import { HandDrawnCanvas } from '@/services/api'

interface HandDrawnMapDisplayProps {
  canvas: HandDrawnCanvas
  width?: number
  height?: number
  className?: string
}

interface MapPoint {
  id: string
  name: string
  x: number
  y: number
  type: string
  description?: string
}

interface MapRoute {
  id: string
  name: string
  points: { x: number; y: number }[]
  color: string
  type: string
}

export default function HandDrawnMapDisplay({ 
  canvas, 
  width = 800, 
  height = 600, 
  className = '' 
}: HandDrawnMapDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return

    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, width, height)

    // Parse and render canvas data
    try {
      const canvasData = JSON.parse(canvas.canvas_data)
      
      // Draw the hand-drawn elements first
      if (canvasData.drawing) {
        drawFromData(ctx, canvasData.drawing)
      }

      // Draw routes
      if (canvasData.routes) {
        canvasData.routes.forEach((route: MapRoute) => {
          drawRoute(ctx, route.points, route.color, false)
        })
      }

      // Draw points on top
      if (canvasData.points) {
        canvasData.points.forEach((point: MapPoint) => {
          drawPoint(ctx, point)
        })
      }
    } catch (e) {
      console.error('Error parsing canvas data:', e)
    }
  }, [canvas, width, height])

  const drawFromData = (ctx: CanvasRenderingContext2D, drawingData: any) => {
    if (drawingData.strokes) {
      drawingData.strokes.forEach((stroke: any) => {
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
  }

  const drawRoute = (ctx: CanvasRenderingContext2D, routePoints: { x: number; y: number }[], color: string, isDashed: boolean) => {
    if (routePoints.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (isDashed) {
      ctx.setLineDash([10, 5])
    } else {
      ctx.setLineDash([])
    }

    ctx.moveTo(routePoints[0].x, routePoints[0].y)
    routePoints.forEach(point => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Draw route points
    routePoints.forEach((point, index) => {
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(point.x, point.y, index === 0 || index === routePoints.length - 1 ? 6 : 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawPoint = (ctx: CanvasRenderingContext2D, point: MapPoint) => {
    const icon = getPointIcon(point.type)
    const color = getPointColor(point.type)

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

    // Draw icon text
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon, point.x, point.y)

    // Draw point name
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(point.name, point.x, point.y + 25)
  }

  const getPointIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      cafe: '☕',
      restaurant: '🍽️',
      landmark: '🏛️',
      viewpoint: '👁️',
      start: '🚀',
      end: '🏁'
    }
    return icons[type] || '📍'
  }

  const getPointColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      cafe: '#8D6E63',
      restaurant: '#F44336',
      landmark: '#2196F3',
      viewpoint: '#4CAF50',
      start: '#FF9800',
      end: '#9C27B0'
    }
    return colors[type] || '#666'
  }

  return (
    <div className={`${className} border border-gray-300 rounded-lg overflow-hidden`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-auto"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}
