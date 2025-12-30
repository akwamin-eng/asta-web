import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRICE_DATA = [
  { month: 'Jan', price: 1200 }, { month: 'Feb', price: 1350 },
  { month: 'Mar', price: 1250 }, { month: 'Apr', price: 1600 },
  { month: 'May', price: 1550 }, { month: 'Jun', price: 1900 },
];

export default function YieldChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={PRICE_DATA}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="month" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
          labelStyle={{ color: '#888' }}
        />
        <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
