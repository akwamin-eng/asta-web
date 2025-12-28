import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, AlertTriangle, Clock, Search, ChevronRight, FileText, Lock, Trash2, Archive
} from 'lucide-react';
import type { UserProfile } from '../../types/asta_types';

// MOCK DATA
const MOCK_MESSAGES = [
  {
    id: 'msg-001',
    sender: 'Central Command',
    subject: 'Welcome, Lead Scout',
    preview: 'Authorization confirmed. Your access level has been upgraded...',
    body: `IDENTITY VERIFIED. ACCESS LEVEL: SCOUT [TIER 2]\n\nWelcome to the network. Your reputation score has unlocked advanced market telemetry.\n\nAs a Lead Scout, your voting power on asset verification is now weighted at 2.5x. Use this power carefully.\n\nAwaiting your first field report.\n\n// END TRANSMISSION`,
    timestamp: '10:42 AM',
    priority: 'high',
    status: 'unread',
    type: 'system'
  },
  {
    id: 'msg-002',
    sender: 'Risk Engine',
    subject: 'Yield Anomaly: East Legon',
    preview: 'Rental yields in Sector 4 are deviating from the 30-day average...',
    body: `AUTOMATED ALERT // RISK LEVEL: MEDIUM\n\nOur algorithms have detected a 12% spike in rental asking prices for 2-bedroom units in East Legon (Sector 4).\n\nRecommended Action:\n- Verify physical asset condition in this sector.\n- Check for new infrastructure projects driving demand.`,
    timestamp: 'Yesterday',
    priority: 'medium',
    status: 'unread',
    type: 'alert'
  }
];

interface SecureInboxProps {
  profile: UserProfile | null;
}

export default function SecureInbox({ profile }: SecureInboxProps) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMessage = messages.find(m => m.id === selectedId);

  return (
    <div className="flex h-full bg-black/20 text-white font-sans overflow-hidden">
      {/* LEFT: LIST */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-2/5 flex-col border-r border-white/10`}>
        <div className="p-3 border-b border-white/10 bg-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
            <input type="text" placeholder="Search logs..." className="w-full bg-black/50 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => setSelectedId(msg.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedId === msg.id ? 'bg-white/10' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-2">
                  <Shield size={10} /> {msg.sender}
                </span>
                <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
              </div>
              <h4 className="text-xs font-medium text-white mb-1 truncate">{msg.subject}</h4>
              <p className="text-[10px] text-gray-500 line-clamp-2">{msg.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CONTENT */}
      <div className={`${!selectedId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-black/40 relative`}>
        {selectedMessage ? (
          <>
            <div className="p-6 border-b border-white/10 bg-white/5">
              <button onClick={() => setSelectedId(null)} className="md:hidden mb-4 text-gray-500 text-xs flex items-center gap-1"><ChevronRight className="rotate-180" size={12}/> Back</button>
              <h2 className="text-lg font-bold text-white mb-2">{selectedMessage.subject}</h2>
              <div className="flex gap-3 text-xs text-gray-400 font-mono">
                <span className="text-emerald-500">{selectedMessage.sender}</span> | <span>{selectedMessage.timestamp}</span>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="text-sm leading-7 text-gray-300 font-mono whitespace-pre-line">{selectedMessage.body}</div>
            </div>
            <div className="p-2 border-t border-white/10 bg-black px-4 flex justify-between">
              <span className="text-[9px] text-emerald-900 uppercase font-bold flex items-center gap-2"><Lock size={8} /> Encrypted</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <Shield size={32} className="opacity-20 mb-4" />
            <p className="text-xs font-mono uppercase">Select a transmission</p>
          </div>
        )}
      </div>
    </div>
  );
}
