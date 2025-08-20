'use client';

import React, { useState, useEffect } from 'react';
import { Article, ViewMode } from '@/lib/types';
import { articlesAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { getErrorMessage } from '@/lib/utils';
import { Search, Grid, List, Calendar, Filter } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    user_id: '',
  });

  useEffect(() => {
    fetchArticles();
  }, [currentPage, filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getArticles({
        page: currentPage,
        per_page: 12,
        view: 'public',
        ...(filters.date && { date: filters.date }),
        ...(filters.user_id && { user_id: parseInt(filters.user_id) }),
      });

      const newArticles = response.data.articles;
      
      if (currentPage === 1) {
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }
      
      setHasMore(response.data.pagination.has_next);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setArticles([]);
  };

  const getGridClass = () => {
    switch (viewMode) {
      case 'list':
        return 'space-y-4';
      case 'card':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'magazine':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading articles</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchArticles();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Public Articles
        </h1>
        <p className="text-gray-600">
          Discover what others are reading and their thoughts
        </p>
      </div>

      {/* Filters and View Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.date}
              onChange={(e) => handleFilterChange({ ...filters, date: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">View:</span>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded ${
              viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Card view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('magazine')}
            className={`p-2 rounded ${
              viewMode === 'magazine' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Magazine view"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found</p>
          <p className="text-gray-400 text-sm mt-2">
            Be the first to share what you're reading!
          </p>
        </div>
      ) : (
        <>
          <div className={getGridClass()}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                viewMode={viewMode}
                onArticleClick={(article) => {
                  // Handle article click - maybe open in modal or navigate to details
                  console.log('Article clicked:', article);
                }}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
