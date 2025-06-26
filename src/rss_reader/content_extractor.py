import requests
from bs4 import BeautifulSoup
from newspaper import Article
import logging
from typing import Optional

class ContentExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-AI-Summarizer/1.0)'
        })
    
    def extract_content(self, url: str) -> Optional[str]:
        """Extract full article content from URL"""
        try:
            # Method 1: Try newspaper3k (usually most reliable)
            content = self.extract_with_newspaper(url)
            if content and len(content) > 200:
                return content
            
            # Method 2: Fallback to BeautifulSoup
            content = self.extract_with_bs4(url)
            if content and len(content) > 200:
                return content
            
            return None
            
        except Exception as e:
            logging.error(f"Error extracting content from {url}: {e}")
            return None
    
    def extract_with_newspaper(self, url: str) -> Optional[str]:
        """Extract content using newspaper3k"""
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            if article.text and len(article.text) > 100:
                return article.text
            return None
            
        except Exception as e:
            logging.debug(f"Newspaper extraction failed for {url}: {e}")
            return None
    
    def extract_with_bs4(self, url: str) -> Optional[str]:
        """Extract content using BeautifulSoup as fallback"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                tag.decompose()
            
            # Try to find main content
            content_selectors = [
                'article', '[role="main"]', '.article-content',
                '.post-content', '.entry-content', 'main'
            ]
            
            for selector in content_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    text = content_elem.get_text(strip=True)
                    if len(text) > 200:
                        return text
            
            # Fallback: get all paragraph text
            paragraphs = soup.find_all('p')
            content = ' '.join([p.get_text(strip=True) for p in paragraphs])
            
            return content if len(content) > 200 else None
            
        except Exception as e:
            logging.debug(f"BS4 extraction failed for {url}: {e}")
            return None