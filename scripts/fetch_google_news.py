import feedparser
import os
from supabase import create_client, Client
from bs4 import BeautifulSoup
from dateutil import parser
import datetime

RSS_URL = "https://news.google.com/rss/search?q=Ghana+Real+Estate+Market&hl=en-GH&gl=GH&ceid=GH:en"
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def clean_html(html_content):
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ", strip=True)

def fetch_and_store_news():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Supabase credentials not found.")
        return

    print(f"Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print(f"Fetching RSS Feed: {RSS_URL}")
    feed = feedparser.parse(RSS_URL)
    
    print(f"Found {len(feed.entries)} articles. Processing...")

    new_articles = []
    
    for entry in feed.entries:
        clean_title = clean_html(entry.title)
        
        raw_summary = getattr(entry, 'summary', '') or getattr(entry, 'description', '')
        clean_summary = clean_html(raw_summary)

        source = entry.source.title if hasattr(entry, 'source') else "Google News"
        
        try:
            published_at = parser.parse(entry.published).isoformat()
        except:
            published_at = datetime.datetime.now().isoformat()

        article = {
            "title": clean_title,
            "url": entry.link,
            "source": source,
            "summary": clean_summary,
            "published_at": published_at,
            "sentiment_score": 0,
            "related_locations": ["Ghana"]
        }
        
        new_articles.append(article)

    if new_articles:
        try:
            data, count = supabase.table("news_articles").upsert(
                new_articles, on_conflict="url"
            ).execute()
            print(f"Successfully processed {len(new_articles)} articles.")
        except Exception as e:
            print(f"Database Insert Error: {e}")
    else:
        print("No articles found to insert.")

if __name__ == "__main__":
    fetch_and_store_news()
