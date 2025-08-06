import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface TourGuide {
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
  created_at: string
  updated_at?: string
}

export interface MapPoint {
  id: number
  name: string
  description?: string
  point_type: string
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
  place_id?: string
  opening_hours?: string
  contact_info?: string
  image_url?: string
  icon_type?: string
  priority: number
  instagram_worthy: boolean
  ar_content_url?: string
  canvas_x?: number
  canvas_y?: number
  created_by?: string
  is_verified: boolean
  created_at: string
}

export interface CreateMapPoint {
  name: string
  description?: string
  point_type: string
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
  place_id?: string
  opening_hours?: string
  contact_info?: string
  image_url?: string
  icon_type?: string
  priority?: number
  instagram_worthy?: boolean
  ar_content_url?: string
  canvas_x?: number
  canvas_y?: number
  created_by?: string
  is_verified?: boolean
}

export interface MapPointSearchRequest {
  city: string
  country?: string
  point_type?: string
  search_query?: string
  latitude?: number
  longitude?: number
  radius_km?: number
}

export interface CitySearchResult {
  city: string
  country: string
  full_name: string
}

export interface MapRoute {
  id: number
  map_id: number
  name: string
  description?: string
  route_type: string
  start_point_id?: number
  end_point_id?: number
  distance_km?: number
  estimated_time?: string
  difficulty?: string
  route_coordinates?: string
  highlights?: string
  tips?: string
  color_code: string
  is_loop: boolean
  created_at: string
  start_point?: MapPoint
  end_point?: MapPoint
}

export interface MapReview {
  id: number
  map_id: number
  reviewer_name: string
  rating: number
  review_text?: string
  visit_date?: string
  verified_visit: boolean
  helpful_count: number
  created_at: string
}

export interface Map {
  id: number
  title: string
  description?: string
  city: string
  country: string
  category: string
  map_type: string
  difficulty_level?: string
  estimated_duration?: string
  price_type: string
  price: number
  map_image_url?: string
  thumbnail_url?: string
  download_count: number
  rating: number
  creator_name?: string
  creator_type: string
  tags?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
  points: MapPoint[]
  routes: MapRoute[]
  reviews?: MapReview[]
}

export interface MapDetailResponse extends Map {
  reviews: MapReview[]
  canvas?: HandDrawnCanvas
}

export interface HandDrawnCanvas {
  id: number
  map_id: number
  canvas_data: string
  canvas_width: number
  canvas_height: number
  background_image_url?: string
  drawing_layers?: string
  created_at: string
  updated_at?: string
}

export interface CreateHandDrawnCanvas {
  canvas_data: string
  canvas_width?: number
  canvas_height?: number
  background_image_url?: string
  drawing_layers?: string
}

export interface UpdateHandDrawnCanvas {
  canvas_data?: string
  canvas_width?: number
  canvas_height?: number
  background_image_url?: string
  drawing_layers?: string
}

export interface MapListResponse {
  maps: Map[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface TourGuideList {
  tour_guides: TourGuide[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface TourGuideFilters {
  page?: number
  per_page?: number
  city?: string
  country?: string
  min_rating?: string
  max_price?: string
  language?: string
}

export interface CreateTourGuide {
  name: string
  city: string
  country: string
  description?: string
  languages: string
  price_per_hour: number
  contact_email: string
  contact_phone?: string
  years_experience?: number
  specialties?: string
  availability?: boolean
  profile_image_url?: string
}

export interface UpdateTourGuide {
  name?: string
  city?: string
  country?: string
  description?: string
  languages?: string
  price_per_hour?: number
  contact_email?: string
  contact_phone?: string
  years_experience?: number
  specialties?: string
  availability?: boolean
  profile_image_url?: string
}

export const tourGuideService = {
  // Get all tour guides with optional filters
  async getTourGuides(filters: TourGuideFilters = {}): Promise<TourGuideList> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/tour-guides?${params.toString()}`)
    return response.data
  },

  // Get a specific tour guide by ID
  async getTourGuide(id: number): Promise<TourGuide> {
    const response = await api.get(`/tour-guides/${id}`)
    return response.data
  },

  // Create a new tour guide
  async createTourGuide(tourGuide: CreateTourGuide): Promise<TourGuide> {
    const response = await api.post('/tour-guides/', tourGuide)
    return response.data
  },

  // Update an existing tour guide
  async updateTourGuide(id: number, tourGuide: UpdateTourGuide): Promise<TourGuide> {
    const response = await api.put(`/tour-guides/${id}`, tourGuide)
    return response.data
  },

  // Delete a tour guide
  async deleteTourGuide(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/tour-guides/${id}`)
    return response.data
  },

  // Get list of cities
  async getCities(): Promise<{ city: string; country: string }[]> {
    const response = await api.get('/tour-guides/cities/list')
    return response.data
  },
}

export const mapsService = {
  // Get all maps with filtering
  async getMaps(params?: {
    page?: number
    per_page?: number
    city?: string
    country?: string
    category?: string
    map_type?: string
    price_type?: string
    difficulty?: string
    featured_only?: boolean
    search?: string
  }): Promise<MapListResponse> {
    const response = await api.get('/maps/', { params })
    return response.data
  },

  // Get a specific map with details
  async getMap(id: number): Promise<MapDetailResponse> {
    const response = await api.get(`/maps/${id}`)
    return response.data
  },

  // Create a new map
  async createMap(mapData: Partial<Map>): Promise<Map> {
    const response = await api.post('/maps/', mapData)
    return response.data
  },

  // Update a map
  async updateMap(id: number, mapData: Partial<Map>): Promise<Map> {
    const response = await api.put(`/maps/${id}`, mapData)
    return response.data
  },

  // Delete a map
  async deleteMap(id: number): Promise<void> {
    await api.delete(`/maps/${id}`)
  },

  // Get map points
  async getMapPoints(params?: {
    city?: string
    country?: string
    point_type?: string
    instagram_worthy?: boolean
    latitude?: number
    longitude?: number
    radius_km?: number
    page?: number
    per_page?: number
  }): Promise<MapPoint[]> {
    const response = await api.get('/maps/points/search', { params })
    return response.data
  },

  // Create a map point
  async createMapPoint(pointData: CreateMapPoint): Promise<MapPoint> {
    const response = await api.post('/maps/points/', pointData)
    return response.data
  },

  // Update a map point
  async updateMapPoint(pointId: number, pointData: Partial<CreateMapPoint>): Promise<MapPoint> {
    const response = await api.put(`/maps/points/${pointId}`, pointData)
    return response.data
  },

  // Delete a map point
  async deleteMapPoint(pointId: number): Promise<void> {
    await api.delete(`/maps/points/${pointId}`)
  },

  // Search map points
  async searchMapPoints(searchRequest: MapPointSearchRequest): Promise<MapPoint[]> {
    const response = await api.post('/maps/points/search', searchRequest)
    return response.data
  },

  // Search cities
  async searchCities(query: string): Promise<CitySearchResult[]> {
    const response = await api.get('/maps/cities/search', { params: { query } })
    return response.data
  },

  // Get routes for a specific map
  async getMapRoutes(mapId: number): Promise<MapRoute[]> {
    const response = await api.get(`/maps/${mapId}/routes/`)
    return response.data
  },

  // Create a route for a map
  async createMapRoute(mapId: number, routeData: Partial<MapRoute>): Promise<MapRoute> {
    const response = await api.post(`/maps/${mapId}/routes/`, routeData)
    return response.data
  },

  // Get reviews for a specific map
  async getMapReviews(mapId: number, params?: {
    page?: number
    per_page?: number
  }): Promise<MapReview[]> {
    const response = await api.get(`/maps/${mapId}/reviews/`, { params })
    return response.data
  },

  // Create a review for a map
  async createMapReview(mapId: number, reviewData: Partial<MapReview>): Promise<MapReview> {
    const response = await api.post(`/maps/${mapId}/reviews/`, reviewData)
    return response.data
  },

  // Get available categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/maps/categories/')
    return response.data
  },

  // Get cities with maps
  async getMapCities(): Promise<{ city: string; country: string; map_count: number }[]> {
    const response = await api.get('/maps/cities/')
    return response.data
  },

  // Hand-drawn canvas endpoints
  async createHandDrawnCanvas(mapId: number, canvasData: CreateHandDrawnCanvas): Promise<HandDrawnCanvas> {
    const response = await api.post(`/maps/${mapId}/canvas/`, canvasData)
    return response.data
  },

  async getHandDrawnCanvas(mapId: number): Promise<HandDrawnCanvas> {
    const response = await api.get(`/maps/${mapId}/canvas/`)
    return response.data
  },

  async updateHandDrawnCanvas(mapId: number, canvasData: UpdateHandDrawnCanvas): Promise<HandDrawnCanvas> {
    const response = await api.put(`/maps/${mapId}/canvas/`, canvasData)
    return response.data
  },

  async deleteHandDrawnCanvas(mapId: number): Promise<{ message: string }> {
    const response = await api.delete(`/maps/${mapId}/canvas/`)
    return response.data
  },
}

export const healthService = {
  // Check API health
  async checkHealth(): Promise<{ status: string }> {
    const response = await axios.get(`${API_BASE_URL}/health`)
    return response.data
  },
}

export default api
