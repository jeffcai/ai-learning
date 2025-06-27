import opml
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional
import logging
from pathlib import Path

class OPMLParser:
    def __init__(self, opml_file_path: str):
        self.opml_file_path = Path(opml_file_path)
        self.feeds = []
        
    def parse_opml(self) -> List[Dict]:
        """Parse OPML file and extract RSS feeds"""
        if not self.opml_file_path.exists():
            logging.error(f"OPML file not found: {self.opml_file_path}")
            return []
        
        try:
            # Method 1: Try using opml library
            feeds = self.parse_with_opml_library()
            if feeds:
                return feeds
            
            # Method 2: Fallback to manual XML parsing
            return self.parse_with_xml()
            
        except Exception as e:
            logging.error(f"Error parsing OPML file: {e}")
            return []
    
    def parse_with_opml_library(self) -> List[Dict]:
        """Parse OPML using the opml library"""
        try:
            with open(self.opml_file_path, 'r', encoding='utf-8') as f:
                outline = opml.parse(f)
            
            feeds = []
            self._extract_feeds_from_outline(outline, feeds)
            
            logging.info(f"Parsed {len(feeds)} feeds from OPML using opml library")
            return feeds
            
        except Exception as e:
            logging.debug(f"OPML library parsing failed: {e}")
            return []
    
    def parse_with_xml(self) -> List[Dict]:
        """Parse OPML manually using XML parser"""
        try:
            tree = ET.parse(self.opml_file_path)
            root = tree.getroot()
            
            feeds = []
            
            # Find all outline elements that have xmlUrl (RSS feeds)
            for outline in root.iter('outline'):
                xml_url = outline.get('xmlUrl')
                html_url = outline.get('htmlUrl')
                title = outline.get('title') or outline.get('text')
                category = outline.get('category', '')
                
                # Get category from parent outline if not present
                if not category:
                    parent = self._find_parent_category(root, outline)
                    category = parent if parent else 'general'
                
                if xml_url:  # This is a feed
                    feed_info = {
                        'url': xml_url,
                        'title': title or 'Unknown Feed',
                        'html_url': html_url,
                        'category': self._clean_category_name(category),
                        'description': outline.get('description', ''),
                        'language': outline.get('language', 'en')
                    }
                    feeds.append(feed_info)
            
            logging.info(f"Parsed {len(feeds)} feeds from OPML using XML parser")
            return feeds
            
        except Exception as e:
            logging.error(f"XML parsing failed: {e}")
            return []
    
    def _extract_feeds_from_outline(self, outline, feeds, category='general'):
        """Recursively extract feeds from OPML outline"""
        if hasattr(outline, '__iter__'):
            for item in outline:
                self._extract_feeds_from_outline(item, feeds, category)
        else:
            # Check if this is a feed or a category
            if hasattr(outline, 'xmlUrl') and outline.xmlUrl:
                feed_info = {
                    'url': outline.xmlUrl,
                    'title': getattr(outline, 'title', getattr(outline, 'text', 'Unknown Feed')),
                    'html_url': getattr(outline, 'htmlUrl', ''),
                    'category': self._clean_category_name(category),
                    'description': getattr(outline, 'description', ''),
                    'language': getattr(outline, 'language', 'en')
                }
                feeds.append(feed_info)
            elif hasattr(outline, 'text') and not hasattr(outline, 'xmlUrl'):
                # This is likely a category
                new_category = getattr(outline, 'text', category)
                if hasattr(outline, '__iter__'):
                    for sub_item in outline:
                        self._extract_feeds_from_outline(sub_item, feeds, new_category)
    
    def _find_parent_category(self, root, target_outline):
        """Find the parent category of an outline element"""
        for outline in root.iter('outline'):
            if not outline.get('xmlUrl'):  # This is a category
                for child in outline:
                    if child == target_outline:
                        return outline.get('text') or outline.get('title')
        return 'general'
    
    def _clean_category_name(self, category: str) -> str:
        """Clean and normalize category names"""
        if not category:
            return 'general'
        
        # Remove special characters and convert to lowercase
        import re
        cleaned = re.sub(r'[^\w\s-]', '', category.lower())
        cleaned = re.sub(r'\s+', '_', cleaned.strip())
        return cleaned or 'general'
    
    def export_to_json(self, output_file: str) -> bool:
        """Export parsed feeds to JSON format (for compatibility)"""
        try:
            import json
            feeds = self.parse_opml()
            
            json_structure = {
                'feeds': [
                    {
                        'url': feed['url'],
                        'category': feed['category'],
                        'title': feed['title'],
                        'description': feed.get('description', '')
                    }
                    for feed in feeds
                ]
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(json_structure, f, indent=2, ensure_ascii=False)
            
            logging.info(f"Exported {len(feeds)} feeds to {output_file}")
            return True
            
        except Exception as e:
            logging.error(f"Error exporting to JSON: {e}")
            return False