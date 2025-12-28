import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/asta_types';

export interface IntelMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read';
  type: 'intel' | 'system' | 'alert';
  property_id?: number; 
}

export function useHunterIntel(profile: UserProfile | null) {
  const [messages, setMessages] = useState<IntelMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH LOGIC
  useEffect(() => {
    if (!profile) return;

    const fetchIntel = async () => {
      setLoading(true);
      
      const systemMsg: IntelMessage = {
        id: 'sys-001',
        sender: 'Central Command',
        subject: 'Identity Verified',
        preview: 'Access granted to Level 2 telemetry...',
        body: `AGENT: ${profile.full_name || 'Unknown'}\nRANK: ${profile.rank_title}\n\nYour neural link to the Asta Network is stable.\n\nReputation Score: ${profile.reputation_score}\n\nUse the "Hunter Config" module to calibrate your target zones.`,
        timestamp: 'Now',
        priority: 'low',
        status: 'read', // System message is always read
        type: 'system'
      };

      let dealMessages: IntelMessage[] = [];
      const prefs = profile.preferences;

      if (prefs && prefs.locations && prefs.locations.length > 0) {
        const { data: matches } = await supabase
          .from('properties') 
          .select('*')
          .in('location_name', prefs.locations) 
          .lte('price', prefs.budget_max || 10000000)
          .limit(5);

        if (matches && matches.length > 0) {
           dealMessages = matches.map((property: any) => ({
             id: `intel-${property.id}`,
             sender: 'Hunter Algorithm',
             subject: `Target Acquired: ${property.location_name}`,
             preview: `Asset matches criteria: ${property.title}...`,
             body: `MATCH CONFIRMED // CONFIDENCE: 98%\n\nAsset: ${property.title}\nZone: ${property.location_name}\nPrice: ${property.currency === 'USD' ? '$' : '₵'}${property.price.toLocaleString()}\n\nLogic: Matches your interest in ${property.location_name}.\n\nRecommending visual verification.`,
             timestamp: 'Just now',
             priority: 'high',
             status: 'unread',
             type: 'intel',
             property_id: property.id
           }));
        } else {
           dealMessages.push({
             id: 'sys-scan-empty',
             sender: 'Hunter Algorithm',
             subject: 'Scan Complete: No Targets',
             preview: 'Market scan of designated zones yielded 0 results...',
             body: `SCAN REPORT // SECTOR: ${prefs.locations.join(', ')}\n\nNo active assets found matching your strict criteria.\n\nRecommendation:\n1. Increase Budget Cap.\n2. Expand Target Zones in Config.\n\nSystem will continue monitoring.`,
             timestamp: 'Just now',
             priority: 'medium',
             status: 'unread',
             type: 'alert'
           });
        }
      }

      setMessages([systemMsg, ...dealMessages]);
      setLoading(false);
    };

    fetchIntel();
  }, [profile]);

  // NEW ACTION: Mark message as read
  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, status: 'read' } : msg
    ));
  };

  return { messages, loading, markAsRead };
}
