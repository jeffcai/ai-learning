import React from 'react';
import { Article } from '@/lib/types';
import { formatDate, getDomainFromUrl, extractTags, truncateText } from '@/lib/utils';
import { ExternalLink, Calendar, Tag, User } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  viewMode: 'list' | 'card' | 'magazine';
  onArticleClick?: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, viewMode, onArticleClick }) => {
  const tags = extractTags(article.tags || []);
  const domain = getDomainFromUrl(article.url);

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  const openUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(article.url, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {article.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.reading_date)}</span>
              </div>
              
              {article.author && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
              
              <span className="text-blue-600">{domain}</span>
            </div>

            {article.notes && (
              <p className="text-gray-700 mb-3">
                {truncateText(article.notes, 200)}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={openUrl}
            className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Open article"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'card') {
    return (
      <div 
        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {article.title}
          </h3>
          <button
            onClick={openUrl}
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
            title="Open article"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(article.reading_date, 'MMM dd')}</span>
          <span>•</span>
          <span className="text-blue-600">{domain}</span>
        </div>

        {article.notes && (
          <p className="text-gray-700 text-sm mb-3 flex-1">
            {truncateText(article.notes, 120)}
          </p>
        )}

        <div className="mt-auto">
          {article.author && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
              <User className="h-3 w-3" />
              <span>{article.author}</span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-500 px-1">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Magazine view
  return (
    <div 
      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Header with title and external link */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {article.title}
          </h3>
          <button
            onClick={openUrl}
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
            title="Open article"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.reading_date)}</span>
          </div>
          {article.author && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            </>
          )}
          <span>•</span>
          <span className="text-blue-600 font-medium">{domain}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {article.notes && (
          <p className="text-gray-700 mb-4 flex-1">
            {truncateText(article.notes, 300)}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center space-x-2 mt-auto">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;
