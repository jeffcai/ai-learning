import feedparser
import requests
from datetime import datetime, timedelta, timezone
from typing import List, Dict
import json
import logging
from .opml_parser import OPMLParser
import pytz

class RSSReader:
    def __init__(self, feeds_config_path: str):
        self.feeds_config_path = feeds_config_path
        self.feeds = self.load_feeds(feeds_config_path)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-AI-Summarizer/1.0)'
        })
    
    def load_feeds(self, config_path: str) -> List[Dict]:
        """Load RSS feeds from OPML or JSON configuration file"""
        try:
            if config_path.lower().endswith('.opml'):
                return self.load_from_opml(config_path)
            else:
                return self.load_from_json(config_path)
        except Exception as e:
            logging.error(f"Error loading feeds configuration: {e}")
            return []
    
    def load_from_opml(self, opml_path: str) -> List[Dict]:
        """Load feeds from OPML file"""
        parser = OPMLParser(opml_path)
        feeds = parser.parse_opml()
        
        logging.info(f"Loaded {len(feeds)} feeds from OPML file")
        
        # Group feeds by category for logging
        categories = {}
        for feed in feeds:
            category = feed['category']
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        for category, count in categories.items():
            logging.info(f"Category '{category}': {count} feeds")
        
        return feeds
    
    def load_from_json(self, json_path: str) -> List[Dict]:
        """Load feeds from JSON configuration file (legacy support)"""
        with open(json_path, 'r') as f:
            config = json.load(f)
            return config.get('feeds', [])
    
    def normalize_datetime(self, dt: datetime) -> datetime:
        """Ensure datetime is timezone-aware"""
        if dt is None:
            return datetime.now(timezone.utc)
        
        # If datetime is naive (no timezone), assume UTC
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        
        # If datetime has timezone info, convert to UTC
        return dt.astimezone(timezone.utc)
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse various date formats and ensure timezone awareness"""
        if not date_str:
            return datetime.now(timezone.utc)
        
        try:
            # Try using dateutil parser first
            import dateutil.parser
            parsed_date = dateutil.parser.parse(date_str)
            return self.normalize_datetime(parsed_date)
        except:
            # Fallback to manual parsing
            try:
                # RFC 2822 format: 'Wed, 02 Oct 2024 12:00:00 GMT'
                parsed_date = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %Z')
                return self.normalize_datetime(parsed_date)
            except:
                try:
                    # RFC 2822 format with timezone offset
                    parsed_date = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
                    return self.normalize_datetime(parsed_date)
                except:
                    try:
                        # ISO format
                        parsed_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S%z')
                        return self.normalize_datetime(parsed_date)
                    except:
                        try:
                            # ISO format without timezone
                            parsed_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
                            return self.normalize_datetime(parsed_date)
                        except:
                            # If all parsing fails, return current time
                            logging.warning(f"Could not parse date: {date_str}, using current time")
                            return datetime.now(timezone.utc)
    
    def fetch_feed(self, feed_info: Dict) -> List[Dict]:
        """Fetch and parse RSS feed"""
        feed_url = feed_info['url']
        try:
            response = self.session.get(feed_url, timeout=15)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            articles = []
            
            if hasattr(feed, 'bozo') and feed.bozo:
                logging.warning(f"Feed parsing warning for {feed_url}: {feed.bozo_exception}")
            
            for entry in feed.entries:
                # Parse the publication date
                published_date = self.parse_date(entry.get('published', ''))
                
                article = {
                    'title': entry.get('title', ''),
                    'link': entry.get('link', ''),
                    'description': self._clean_description(entry.get('description', '')),
                    'published': published_date,
                    'source': feed_info.get('title', feed.feed.get('title', 'Unknown')),
                    'category': entry.get('category', ''),
                    'guid': entry.get('id', entry.get('link', '')),
                    'feed_category': feed_info.get('category', 'general'),
                    'feed_title': feed_info.get('title', ''),
                    'author': entry.get('author', ''),
                    'tags': self._extract_tags(entry)
                }
                articles.append(article)
            
            return articles
            
        except Exception as e:
            logging.error(f"Error fetching feed {feed_url}: {e}")
            return []
    
    def _clean_description(self, description: str) -> str:
        """Clean HTML from description"""
        if not description:
            return ''
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(description, 'html.parser')
        return soup.get_text(strip=True)
    
    def _extract_tags(self, entry) -> List[str]:
        """Extract tags from feed entry"""
        tags = []
        
        # Try to get tags from various fields
        if hasattr(entry, 'tags'):
            for tag in entry.tags:
                if hasattr(tag, 'term'):
                    tags.append(tag.term)
                elif isinstance(tag, str):
                    tags.append(tag)
        
        # Also check categories
        if hasattr(entry, 'category'):
            tags.append(entry.category)
        
        return list(set(tags))  # Remove duplicates
    
    def fetch_all_feeds(self, hours_back: int = 24, max_articles_per_feed: int = 10) -> List[Dict]:
        """Fetch articles from all configured feeds"""
        all_articles = []
        
        # Create timezone-aware cutoff date
        cutoff_date = datetime.now(timezone.utc) - timedelta(hours=hours_back)
        
        total_feeds = len(self.feeds)
        processed_feeds = 0
        
        for feed_info in self.feeds:
            feed_url = feed_info['url']
            category = feed_info.get('category', 'general')
            
            logging.info(f"Fetching feed ({processed_feeds + 1}/{total_feeds}): {feed_info.get('title', feed_url)}")
            
            try:
                articles = self.fetch_feed(feed_info)
                
                # Filter recent articles with proper timezone comparison
                recent_articles = []
                for article in articles:
                    try:
                        article_date = article['published']
                        # Ensure both dates are timezone-aware for comparison
                        if article_date > cutoff_date:
                            recent_articles.append(article)
                    except Exception as e:
                        logging.warning(f"Date comparison error for article {article.get('title', 'Unknown')}: {e}")
                        # Include article if we can't compare dates
                        recent_articles.append(article)
                
                # Limit articles per feed to avoid overwhelming
                if len(recent_articles) > max_articles_per_feed:
                    # Sort by publication date (newest first) before limiting
                    recent_articles.sort(key=lambda x: x['published'], reverse=True)
                    recent_articles = recent_articles[:max_articles_per_feed]
                    logging.info(f"Limited to {max_articles_per_feed} most recent articles from {feed_info.get('title', feed_url)}")
                
                all_articles.extend(recent_articles)
                logging.info(f"Found {len(recent_articles)} recent articles from {feed_info.get('title', feed_url)}")
                
            except Exception as e:
                logging.error(f"Failed to process feed {feed_url}: {e}")
            
            processed_feeds += 1
        
        # Remove duplicates based on link or guid
        unique_articles = self._remove_duplicates(all_articles)
        
        # Sort all articles by publication date (newest first)
        try:
            unique_articles.sort(key=lambda x: x['published'], reverse=True)
        except Exception as e:
            logging.warning(f"Could not sort articles by date: {e}")
        
        logging.info(f"Total unique articles fetched: {len(unique_articles)} from {total_feeds} feeds")
        return unique_articles
    
    def _remove_duplicates(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles based on link or guid"""
        seen = set()
        unique_articles = []
        
        for article in articles:
            identifier = article.get('guid') or article.get('link', '')
            if identifier and identifier not in seen:
                seen.add(identifier)
                unique_articles.append(article)
        
        removed_count = len(articles) - len(unique_articles)
        if removed_count > 0:
            logging.info(f"Removed {removed_count} duplicate articles")
        
        return unique_articles
    
    def get_feed_statistics(self) -> Dict:
        """Get statistics about loaded feeds"""
        categories = {}
        total_feeds = len(self.feeds)
        
        for feed in self.feeds:
            category = feed.get('category', 'general')
            if category not in categories:
                categories[category] = {
                    'count': 0,
                    'feeds': []
                }
            categories[category]['count'] += 1
            categories[category]['feeds'].append(feed.get('title', feed['url']))
        
        return {
            'total_feeds': total_feeds,
            'categories': categories,
            'category_count': len(categories)
        }
    
    def export_feeds_to_json(self, output_file: str) -> bool:
        """Export current feeds to JSON format"""
        try:
            json_structure = {
                'feeds': [
                    {
                        'url': feed['url'],
                        'category': feed.get('category', 'general'),
                        'title': feed.get('title', ''),
                        'description': feed.get('description', '')
                    }
                    for feed in self.feeds
                ]
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(json_structure, f, indent=2, ensure_ascii=False)
            
            logging.info(f"Exported {len(self.feeds)} feeds to {output_file}")
            return True
            
        except Exception as e:
            logging.error(f"Error exporting feeds to JSON: {e}")
            return False