export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_admin: boolean;
  oauth_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  url: string;
  content?: string;
  notes?: string;
  tags?: string[] | string;  // Can be array from API or string from forms
  reading_date: string;
  is_public: boolean;
  user_id: number;
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface Digest {
  id: number;
  title: string;
  content: string;
  summary?: string;
  week_start: string;
  week_end: string;
  is_published: boolean;
  is_public: boolean;
  user_id: number;
  author?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationInfo;
}

export interface DigestsResponse {
  digests: Digest[];
  pagination: PaginationInfo;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export type ViewMode = 'list' | 'card' | 'magazine';
export type ViewType = 'public' | 'own';
