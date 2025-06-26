#!/usr/bin/env python3
import os
import sys
import logging
from datetime import datetime, date
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from dotenv import load_dotenv
    import schedule
    import time
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Please run: pip install -r requirements.txt")
    sys.exit(1)

# Now import our modules
try:
    from src.rss_reader.rss_reader import RSSReader
    from src.rss_reader.content_extractor import ContentExtractor
    from src.rss_reader.ai_summarizer import AISummarizer
    from src.rss_reader.database import DatabaseManager
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure all files exist and __init__.py files are present")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Configure logging
log_file = project_root / 'rss_summarizer.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

class RSSAISummarizer:
    def __init__(self):
        # Use absolute paths
        config_path = project_root / 'config' / 'rss_feeds.json'
        db_path = project_root / 'data' / 'articles.db'
        
        # Create directories if they don't exist
        config_path.parent.mkdir(exist_ok=True)
        db_path.parent.mkdir(exist_ok=True)
        
        # Create default config if it doesn't exist
        if not config_path.exists():
            self.create_default_config(config_path)
        
        self.rss_reader = RSSReader(str(config_path))
        self.content_extractor = ContentExtractor()
        self.ai_summarizer = AISummarizer()
        self.db = DatabaseManager(str(db_path))
    
    def create_default_config(self, config_path: Path):
        """Create a default RSS feeds configuration"""
        default_config = {
            "feeds": [
                {
                    "url": "https://feeds.bbci.co.uk/news/rss.xml",
                    "category": "news"
                },
                {
                    "url": "https://rss.cnn.com/rss/edition.rss",
                    "category": "news"
                },
                {
                    "url": "https://techcrunch.com/feed/",
                    "category": "technology"
                }
            ]
        }
        
        import json
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        logging.info(f"Created default config at: {config_path}")
    
    def process_daily_articles(self):
        """Main processing function"""
        logging.info("Starting daily article processing...")
        
        try:
            # Step 1: Fetch new articles
            articles = self.rss_reader.fetch_all_feeds(hours_back=24)
            logging.info(f"Fetched {len(articles)} articles")
            
            processed_count = 0
            
            for article in articles:
                try:
                    # Step 2: Extract full content
                    if not article.get('content'):
                        content = self.content_extractor.extract_content(article['link'])
                        article['content'] = content
                    
                    # Step 3: Generate summary
                    if article.get('content'):
                        summary_result = self.ai_summarizer.summarize_article(
                            article['content'], 
                            article['title']
                        )
                        
                        if summary_result:
                            article['summary'] = summary_result['summary']
                            article['summary_method'] = summary_result['method']
                    
                    # Step 4: Save to database
                    if self.db.save_article(article):
                        processed_count += 1
                    
                except Exception as e:
                    logging.error(f"Error processing article {article.get('title', 'Unknown')}: {e}")
            
            logging.info(f"Processed {processed_count} articles")
            
            # Step 5: Generate daily digest
            self.generate_daily_digest()
            
        except Exception as e:
            logging.error(f"Error in daily processing: {e}")
    
    def generate_daily_digest(self):
        """Generate and save daily digest"""
        try:
            today = date.today().isoformat()
            articles = self.db.get_articles_by_date(today)
            
            if not articles:
                logging.info("No articles found for today's digest")
                return
            
            # Prepare summaries for digest
            summaries = []
            for article in articles:
                if article.get('summary'):
                    summaries.append({
                        'title': article['title'],
                        'summary': article['summary'],
                        'source': article['source'],
                        'category': article.get('feed_category', 'general'),
                        'link': article['link']
                    })
            
            # Generate digest
            digest = self.ai_summarizer.generate_daily_digest(summaries)
            
            # Save digest
            self.db.save_daily_digest(today, digest, len(summaries))
            
            # Save digest to file
            digest_dir = project_root / "digests"
            digest_dir.mkdir(exist_ok=True)
            
            digest_file = digest_dir / f"digest_{today}.txt"
            with open(digest_file, 'w', encoding='utf-8') as f:
                f.write(digest)
            
            logging.info(f"Generated daily digest with {len(summaries)} articles")
            print(f"Digest saved to: {digest_file}")
            
        except Exception as e:
            logging.error(f"Error generating daily digest: {e}")
    
    def run_once(self):
        """Run processing once"""
        self.process_daily_articles()
    
    def run_scheduler(self):
        """Run the scheduler"""
        # Schedule daily processing at 8 AM
        schedule.every().day.at("08:00").do(self.process_daily_articles)
        
        # Schedule additional processing every 4 hours
        schedule.every(4).hours.do(self.process_daily_articles)
        
        logging.info("Scheduler started. Press Ctrl+C to stop.")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logging.info("Scheduler stopped by user")

def main():
    try:
        summarizer = RSSAISummarizer()
        
        # Check command line arguments
        if len(sys.argv) > 1 and sys.argv[1] == "--once":
            # Run once and exit
            summarizer.run_once()
        else:
            # Run once immediately, then start scheduler
            summarizer.run_once()
            summarizer.run_scheduler()
            
    except Exception as e:
        logging.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()