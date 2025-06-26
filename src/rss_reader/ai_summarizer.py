import os
from typing import List, Dict, Optional
from huggingface_hub import InferenceClient
import logging

class AISummarizer:
    def __init__(self):
        self.hf_token = os.getenv('HF_TOKEN')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        
        if self.hf_token:
            self.hf_client = InferenceClient(token=self.hf_token)
        else:
            self.hf_client = None
            
        # Initialize OpenAI client if available
        if self.openai_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=self.openai_key)
            except ImportError:
                logging.warning("OpenAI library not installed")
                self.openai_client = None
        else:
            self.openai_client = None
    
    def summarize_article(self, content: str, title: str = "") -> Optional[Dict]:
        """Summarize a single article"""
        if not content or len(content) < 100:
            return None
        
        # Try different summarization methods
        summary = None
        method_used = None
        
        # Method 1: Hugging Face
        if self.hf_client:
            summary = self.summarize_with_hf(content)
            if summary:
                method_used = "huggingface"
        
        # Method 2: OpenAI (fallback)
        if not summary and self.openai_client:
            summary = self.summarize_with_openai(content, title)
            if summary:
                method_used = "openai"
        
        # Method 3: Local extraction (fallback)
        if not summary:
            summary = self.extract_key_sentences(content)
            method_used = "extractive"
        
        return {
            'summary': summary,
            'method': method_used,
            'original_length': len(content),
            'summary_length': len(summary) if summary else 0
        }
    
    def summarize_with_hf(self, content: str) -> Optional[str]:
        """Summarize using Hugging Face"""
        try:
            # Truncate content if too long (most models have token limits)
            max_length = 3000
            if len(content) > max_length:
                content = content[:max_length] + "..."
            
            models_to_try = [
                "facebook/bart-large-cnn",
                "t5-base",
                "google/pegasus-xsum"
            ]
            
            for model in models_to_try:
                try:
                    result = self.hf_client.summarization(
                        text=content,
                        model=model,
                        max_length=150,
                        min_length=50
                    )
                    
                    if isinstance(result, list) and len(result) > 0:
                        return result[0].get('summary_text', '')
                    elif isinstance(result, dict):
                        return result.get('summary_text', '')
                        
                except Exception as e:
                    logging.debug(f"HF model {model} failed: {e}")
                    continue
            
            return None
            
        except Exception as e:
            logging.error(f"HF summarization error: {e}")
            return None
    
    def summarize_with_openai(self, content: str, title: str = "") -> Optional[str]:
        """Summarize using OpenAI"""
        try:
            prompt = f"""
            Please provide a concise summary of the following article in 2-3 sentences:
            
            Title: {title}
            
            Content: {content[:3000]}...
            
            Summary:
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes news articles."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logging.error(f"OpenAI summarization error: {e}")
            return None
    
    def extract_key_sentences(self, content: str, num_sentences: int = 3) -> str:
        """Simple extractive summarization as fallback"""
        sentences = content.split('. ')
        if len(sentences) <= num_sentences:
            return content
        
        # Simple heuristic: take first sentence, middle sentences, and last sentence
        key_sentences = [
            sentences[0],
            sentences[len(sentences) // 2],
            sentences[-1]
        ]
        
        return '. '.join(key_sentences)
    
    def generate_daily_digest(self, summaries: List[Dict]) -> str:
        """Generate a daily digest from multiple article summaries"""
        if not summaries:
            return "No articles found for today."
        
        # Group by category
        categories = {}
        for item in summaries:
            category = item.get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(item)
        
        digest = f"Daily News Digest - {len(summaries)} articles\n\n"
        
        for category, articles in categories.items():
            digest += f"## {category.title()}\n\n"
            for article in articles:
                digest += f"**{article['title']}**\n"
                digest += f"{article['summary']}\n"
                digest += f"Source: {article['source']}\n\n"
        
        return digest