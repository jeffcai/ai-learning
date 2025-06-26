import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import logging

class DatabaseManager:
    def __init__(self, db_path: str = "data/articles.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    guid TEXT UNIQUE,
                    title TEXT,
                    link TEXT,
                    description TEXT,
                    content TEXT,
                    summary TEXT,
                    published DATETIME,
                    processed DATETIME,
                    source TEXT,
                    category TEXT,
                    feed_category TEXT,
                    summary_method TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS daily_digests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE UNIQUE,
                    digest_content TEXT,
                    article_count INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def save_article(self, article: Dict) -> bool:
        """Save article to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO articles 
                    (guid, title, link, description, content, summary, published, 
                     processed, source, category, feed_category, summary_method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    article.get('guid'),
                    article.get('title'),
                    article.get('link'),
                    article.get('description'),
                    article.get('content'),
                    article.get('summary'),
                    article.get('published'),
                    datetime.now(),
                    article.get('source'),
                    article.get('category'),
                    article.get('feed_category'),
                    article.get('summary_method')
                ))
                conn.commit()
                return True
        except Exception as e:
            logging.error(f"Error saving article: {e}")
            return False
    
    def get_articles_by_date(self, date: str) -> List[Dict]:
        """Get articles for a specific date"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM articles 
                WHERE DATE(published) = ? 
                ORDER BY published DESC
            """, (date,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def save_daily_digest(self, date: str, digest: str, article_count: int):
        """Save daily digest"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO daily_digests 
                (date, digest_content, article_count)
                VALUES (?, ?, ?)
            """, (date, digest, article_count))
            conn.commit()
    
    def get_unprocessed_articles(self) -> List[Dict]:
        """Get articles without summaries"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM articles 
                WHERE summary IS NULL OR summary = ''
                ORDER BY published DESC
            """)
            
            return [dict(row) for row in cursor.fetchall()]