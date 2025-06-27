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
    from src.rss_reader.opml_parser import OPMLParser
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
    def __init__(self, config_file: str = None):
        # Use absolute paths
        if config_file:
            config_path = Path(config_file)
        else:
            # Look for OPML file first, then JSON
            opml_path = project_root / 'config' / 'feedly_feeds.opml'
            json_path = project_root / 'config' / 'rss_feeds.json'
            
            if opml_path.exists():
                config_path = opml_path
            elif json_path.exists():
                config_path = json_path
            else:
                config_path = opml_path  # Will create default
        
        db_path = project_root / 'data' / 'articles.db'
        
        # Create directories if they don't exist
        config_path.parent.mkdir(exist_ok=True)
        db_path.parent.mkdir(exist_ok=True)
        
        # Create default config if it doesn't exist
        if not config_path.exists():
            if config_path.suffix.lower() == '.opml':
                self.create_default_opml(config_path)
            else:
                self.create_default_json_config(config_path)
        
        self.config_path = config_path
        self.rss_reader = RSSReader(str(config_path))
        self.content_extractor = ContentExtractor()
        self.ai_summarizer = AISummarizer()
        self.db = DatabaseManager(str(db_path))
        
        # Print feed statistics
        stats = self.rss_reader.get_feed_statistics()
        logging.info(f"Loaded {stats['total_feeds']} feeds across {stats['category_count']} categories")
    
    def create_default_opml(self, opml_path: Path):
        """Create a default OPML file with sample feeds"""
        opml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
    <head>
        <title>RSS Feeds</title>
        <dateCreated>Sun, 26 Jun 2025 00:00:00 GMT</dateCreated>
    </head>
    <body>
        <outline text="News" title="News">
            <outline type="rss" text="BBC News" title="BBC News" xmlUrl="https://feeds.bbci.co.uk/news/rss.xml" htmlUrl="https://www.bbc.com/news"/>
            <outline type="rss" text="CNN" title="CNN" xmlUrl="https://rss.cnn.com/rss/edition.rss" htmlUrl="https://www.cnn.com"/>
            <outline type="rss" text="Reuters" title="Reuters" xmlUrl="https://feeds.reuters.com/reuters/topNews" htmlUrl="https://www.reuters.com"/>
        </outline>
        <outline text="Technology" title="Technology">
            <outline type="rss" text="TechCrunch" title="TechCrunch" xmlUrl="https://techcrunch.com/feed/" htmlUrl="https://techcrunch.com"/>
            <outline type="rss" text="The Verge" title="The Verge" xmlUrl="https://www.theverge.com/rss/index.xml" htmlUrl="https://www.theverge.com"/>
            <outline type="rss" text="Ars Technica" title="Ars Technica" xmlUrl="https://feeds.arstechnica.com/arstechnica/index" htmlUrl="https://arstechnica.com"/>
        </outline>
        <outline text="Science" title="Science">
            <outline type="rss" text="Science Daily" title="Science Daily" xmlUrl="https://www.sciencedaily.com/rss/all.xml" htmlUrl="https://www.sciencedaily.com"/>
        </outline>
    </body>
</opml>'''
        
        with open(opml_path, 'w', encoding='utf-8') as f:
            f.write(opml_content)
        
        logging.info(f"Created default OPML config at: {opml_path}")
    
    def create_default_json_config(self, config_path: Path):
        """Create a default JSON configuration (legacy support)"""
        default_config = {
            "feeds": [
                {
                    "url": "https://feeds.bbci.co.uk/news/rss.xml",
                    "category": "news",
                    "title": "BBC News"
                },
                {
                    "url": "https://rss.cnn.com/rss/edition.rss",
                    "category": "news",
                    "title": "CNN"
                },
                {
                    "url": "https://techcrunch.com/feed/",
                    "category": "technology",
                    "title": "TechCrunch"
                }
            ]
        }
        
        import json
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        logging.info(f"Created default JSON config at: {config_path}")
    
    def convert_opml_to_json(self, output_file: str = None):
        """Convert OPML to JSON format"""
        if not output_file:
            output_file = str(project_root / 'config' / 'rss_feeds.json')
        
        return self.rss_reader.export_feeds_to_json(output_file)
    
    def process_daily_articles(self):
        """Main processing function"""
        logging.info("Starting daily article processing...")
        
        try:
            # Step 1: Fetch new articles
            articles = self.rss_reader.fetch_all_feeds(hours_back=24, max_articles_per_feed=15)
            logging.info(f"Fetched {len(articles)} articles")
            
            if not articles:
                logging.warning("No articles found. Check your RSS feeds configuration.")
                return
            
            processed_count = 0
            
            for i, article in enumerate(articles, 1):
                try:
                    logging.info(f"Processing article {i}/{len(articles)}: {article.get('title', 'Unknown')[:100]}...")
                    
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
                            logging.info(f"Generated summary using {summary_result['method']}")
                    
                    # Step 4: Save to database
                    if self.db.save_article(article):
                        processed_count += 1
                    
                except Exception as e:
                    logging.error(f"Error processing article {article.get('title', 'Unknown')}: {e}")
            
            logging.info(f"Successfully processed {processed_count}/{len(articles)} articles")
            
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
                        'link': article['link'],
                        'published': article['published']
                    })
            
            if not summaries:
                logging.info("No summarized articles found for digest")
                return
            
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
    
    def show_feed_stats(self):
        """Display feed statistics"""
        stats = self.rss_reader.get_feed_statistics()
        
        print(f"\n📊 Feed Statistics:")
        print(f"Total feeds: {stats['total_feeds']}")
        print(f"Categories: {stats['category_count']}")
        print("\nFeeds by category:")
        
        for category, info in stats['categories'].items():
            print(f"  {category}: {info['count']} feeds")
            for feed_title in info['feeds'][:3]:  # Show first 3
                print(f"    - {feed_title}")
            if len(info['feeds']) > 3:
                print(f"    ... and {len(info['feeds']) - 3} more")
    
    def run_once(self):
        """Run processing once"""
        self.show_feed_stats()
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
    import argparse
    
    parser = argparse.ArgumentParser(description='RSS AI Summarizer with OPML support')
    parser.add_argument('--config', '-c', help='Path to OPML or JSON config file')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    parser.add_argument('--convert-opml', help='Convert OPML to JSON format')
    parser.add_argument('--stats', action='store_true', help='Show feed statistics only')
    
    args = parser.parse_args()
    
    try:
        if args.convert_opml:
            # Convert OPML to JSON
            parser = OPMLParser(args.convert_opml)
            output_file = args.convert_opml.replace('.opml', '.json')
            if parser.export_to_json(output_file):
                print(f"Converted {args.convert_opml} to {output_file}")
            else:
                print("Conversion failed")
            return
        
        summarizer = RSSAISummarizer(args.config)
        
        if args.stats:
            # Show statistics only
            summarizer.show_feed_stats()
        elif args.once:
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