import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface IntelItem {
  id: string;
  title: string;
  summary?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  date: string;
  type: 'news' | 'market_report';
}

export function useMarketIntel() {
  const [intel, setIntel] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntel() {
      try {
        // 1. Fetch recent News
        const { data: news } = await supabase
          .from('news_articles')
          .select('id, title, summary, sentiment_score, source, published_at')
          .order('published_at', { ascending: false })
          .limit(3);

        // 2. Fetch Market Insights
        const { data: insights } = await supabase
          .from('ghana_market_insights')
          .select('id, title, confidence, insight_source, publish_time')
          .limit(2);

        // 3. Merge & Normalize
        const formattedNews = (news || []).map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          sentiment: n.sentiment_score > 0 ? 'positive' : n.sentiment_score < 0 ? 'negative' : 'neutral',
          source: n.source || 'Asta Scout',
          date: n.published_at,
          type: 'news' as const
        }));

        const formattedInsights = (insights || []).map(i => ({
          id: i.id,
          title: i.title,
          summary: `Confidence: ${i.confidence}`,
          sentiment: 'neutral',
          source: i.insight_source || 'Market Analyst',
          date: i.publish_time,
          type: 'market_report' as const
        }));

        setIntel([...formattedNews, ...formattedInsights]);
      } catch (e) {
        console.error('Intel Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchIntel();
  }, []);

  return { intel, loading };
}
