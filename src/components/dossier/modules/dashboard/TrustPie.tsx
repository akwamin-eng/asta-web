import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TrustPieProps {
  data?: Array<{ name: string; value: number; color: string }>;
}

export default function TrustPie({ data = [] }: TrustPieProps) {
  // Calculate total for center display (optional, adds context)
  const totalVotes = useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  );

  // If no data, render a subtle "Ghost Ring" instead of just text
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50">
        <div className="relative w-[100px] h-[100px] rounded-full border-4 border-gray-800 border-dashed animate-pulse" />
        <span className="text-[10px] text-gray-500 mt-2 font-mono">
          NO INTEL
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[120px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={45} // Slightly thinner ring
              outerRadius={65}
              paddingAngle={4} // Clean gaps between sections
              cornerRadius={4} // Modern rounded ends
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "rgba(17, 17, 17, 0.9)",
                borderColor: "#333",
                borderRadius: "6px",
                fontSize: "11px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                padding: "8px",
              }}
              itemStyle={{ color: "#e5e7eb", fontWeight: 500 }}
              formatter={(value: number) => [`${value} Votes`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label: Total Votes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="block text-lg font-bold text-white leading-none">
              {totalVotes}
            </span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">
              Votes
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Legend: Matches the actual data passed in */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-400 mt-1">
        {data.map((entry, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
        ))}
      </div>
    </div>
  );
}
