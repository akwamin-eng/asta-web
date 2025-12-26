import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useLiveListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState<any | null>(null);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setListings(data);
    };

    fetchInitial();

    // 2. Real-time Subscription
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'properties' },
        (payload) => {
          setListings((current) => [payload.new, ...current]);
          setNewAlert(payload.new);
          setTimeout(() => setNewAlert(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { listings, newAlert };
}
