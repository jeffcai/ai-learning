import feedparser
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import json
import logging

class RSSReader:
    def __init__(self, feeds_config_path: str):
        self.feeds = self.load_feeds(feeds_config_path)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-AI-Summarizer/1.0)'
        })
    
    def load_feeds(self, config_path: str) -> List[Dict]:
        """Load RSS feeds from configuration file"""
        with open(config_path, 'r') as f:
            return json.load(f)['feeds']
    
    def fetch_feed(self, feed_url: str) -> List[Dict]:
        """Fetch and parse RSS feed"""
        try:
            response = self.session.get(feed_url, timeout=10)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            articles = []
            
            for entry in feed.entries:
                article = {
                    'title': entry.get('title', ''),
                    'link': entry.get('link', ''),
                    'description': entry.get('description', ''),
                    'published': self.parse_date(entry.get('published', '')),
                    'source': feed.feed.get('title', 'Unknown'),
                    'category': entry.get('category', ''),
                    'guid': entry.get('id', entry.get('link', ''))
                }
                articles.append(article)
            
            return articles
            
        except Exception as e:
            logging.error(f"Error fetching feed {feed_url}: {e}")
            return []
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse various date formats"""
        try:
            return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
        except:
            try:
                return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S%z')
            except:
                return datetime.now()
    
    def fetch_all_feeds(self, hours_back: int = 24) -> List[Dict]:
        """Fetch articles from all configured feeds"""
        all_articles = []
        cutoff_date = datetime.now() - timedelta(hours=hours_back)
        
        for feed_config in self.feeds:
            feed_url = feed_config['url']
            category = feed_config.get('category', 'general')
            
            logging.info(f"Fetching feed: {feed_url}")
            articles = self.fetch_feed(feed_url)
            
            # Filter recent articles
            recent_articles = [
                {**article, 'feed_category': category}
                for article in articles
                if article['published'] > cutoff_date
            ]
            
            all_articles.extend(recent_articles)
        
        return all_articles