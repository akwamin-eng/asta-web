import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TrustPieProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export default function TrustPie({ data }: TrustPieProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
               itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-3 text-[10px] text-gray-400 mt-2">
         <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Verified</span>
         <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Risk</span>
      </div>
    </div>
  );
}
