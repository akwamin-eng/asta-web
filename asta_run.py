import os
import sys
import time
import json

def run_asta_pipeline():
    print("🤖 Asta Autopilot: Starting Pipeline...")

    # 1. Verify Imports First (Fail Fast)
    try:
        from google import genai
        from google.genai import types
        from supabase import create_client, Client
        print("✅ SDKs (Google GenAI & Supabase) loaded successfully.")
    except ImportError as e:
        print(f"❌ CRITICAL IMPORT ERROR: {e}")
        # Debugging: Print where python is looking
        print(f"Python Path: {sys.path}")
        sys.exit(1)

    # 2. Check Environment Variables
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

    if not all([SUPABASE_URL, SUPABASE_KEY, GOOGLE_API_KEY]):
        print("❌ Error: Missing Environment Variables.")
        print(f"   - SUPABASE_URL: {'Found' if SUPABASE_URL else 'Missing'}")
        print(f"   - SUPABASE_KEY: {'Found' if SUPABASE_KEY else 'Missing'}")
        print(f"   - GOOGLE_API_KEY: {'Found' if GOOGLE_API_KEY else 'Missing'}")
        sys.exit(1)

    # 3. Initialize Clients
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"❌ Client Initialization Failed: {e}")
        sys.exit(1)

    # 4. Run Analysis Logic
    print("🔍 Checking for pending intelligence...")
    
    # Fetch Pending News
    response = supabase.table('market_news')\
        .select("*")\
        .eq('status', 'pending_enrichment')\
        .limit(10)\
        .execute()
    
    news_items = response.data
    
    if not news_items:
        print("💤 No pending items found. Pipeline sleeping.")
        return

    print(f"⚡ Analyzing {len(news_items)} assets...")

    for item in news_items:
        try:
            print(f"   ↳ Processing: {item['title'][:40]}...")
            
            # Construct Prompt
            prompt = f"""
            Analyze this news summary regarding the Ghanaian Market/Economy.
            
            TITLE: {item['title']}
            SUMMARY: {item['summary']}
            
            Task:
            1. Determine the Sentiment Score (-1.0 to 1.0) where -1 is negative for economy/housing, 1 is positive.
            2. Write a 1-sentence strategic insight for a Real Estate Investor.
            
            Output JSON format only:
            {{
                "sentiment": 0.5,
                "insight": "Your insight here"
            }}
            """

            # Call Gemini
            result = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse & Update
            ai_data = json.loads(result.text)
            
            update_payload = {
                "sentiment_score": ai_data.get('sentiment', 0),
                "ai_summary": ai_data.get('insight', 'Analysis pending review.'),
                "status": "enriched"
            }
            
            supabase.table('market_news').update(update_payload).eq('id', item['id']).execute()
            print(f"      ✅ Enriched: Sentiment {ai_data.get('sentiment')}")
            
            # Polite Rate Limiting
            time.sleep(1)

        except Exception as e:
            print(f"      ❌ Analysis Failed: {e}")
            # Mark as failed to prevent infinite loops
            supabase.table('market_news').update({"status": "failed"}).eq('id', item['id']).execute()

    print("✅ Pipeline Step Complete.")

if __name__ == "__main__":
    run_asta_pipeline()
