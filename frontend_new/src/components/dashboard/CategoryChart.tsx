import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { Chemical } from '../../types/inventory';

export function CategoryChart({ chemicals }: {chemicals: Chemical[];}) {
  const data = React.useMemo(() => {
    const counts = new Map<string, number>();
    chemicals.forEach((c) => counts.set(c.category, (counts.get(c.category) ?? 0) + 1));
    return Array.from(counts, ([category, count]) => ({ category, count })).sort(
      (a, b) => b.count - a.count
    );
  }, [chemicals]);

  return (
    <div className="h-72 w-full px-2 pb-4 pt-5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }} />
          
          <YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            width={78}
            tick={{ fill: '#334155', fontSize: 12 }} />
          
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              boxShadow: '0 12px 32px -8px rgba(10,18,32,0.18)'
            }} />
          
          <Bar dataKey="count" name="Catalogue items" radius={[0, 3, 3, 0]} barSize={16}>
            {data.map((entry, index) =>
            <Cell
              key={entry.category}
              fill={index === 0 ? '#1d5ae3' : index < 3 ? '#599bff' : '#bcd7ff'} />

            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);

}