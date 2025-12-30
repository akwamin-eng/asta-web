import React from 'react';
import { AlertTriangle, TrendingDown, ShieldCheck } from 'lucide-react';

interface Anomaly {
  id: string;
  title: string;
  deviation: number;
  location: string;
  type: 'price_drop' | 'suspicious_activity';
}

interface AnomalyFeedProps {
  data?: Anomaly[];
}

export default function AnomalyFeed({ data = [] }: AnomalyFeedProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50 py-8">
        <ShieldCheck size={24} className="mb-2" />
        <p className="text-[10px] uppercase font-bold">Grid Secure</p>
        <p className="text-[9px]">No anomalies detected in this sector.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-2 rounded hover:bg-red-500/10 transition-colors cursor-pointer group">
          <div className="p-1.5 bg-red-500/20 rounded text-red-500 group-hover:text-red-400 transition-colors">
            {item.type === 'price_drop' ? <TrendingDown size={12} /> : <AlertTriangle size={12} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-gray-200 truncate">{item.title}</h4>
              <span className="text-[9px] font-mono text-red-400 font-bold">-{item.deviation}%</span>
            </div>
            <p className="text-[9px] text-gray-500 truncate font-mono">{item.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
