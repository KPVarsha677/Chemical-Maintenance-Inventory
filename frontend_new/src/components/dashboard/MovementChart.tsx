import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { consumptionByMonth } from '../../data/transactions';

export function MovementChart() {
  return (
    <div className="h-72 w-full px-2 pb-4 pt-5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={consumptionByMonth}
          margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }} />
          
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={48} />
          
          <Tooltip
            cursor={{ stroke: '#cbd5e1' }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              boxShadow: '0 12px 32px -8px rgba(10,18,32,0.18)'
            }} />
          
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, paddingTop: 8, color: '#475569' }} />
          
          <Area
            type="monotone"
            dataKey="received"
            name="Received (units)"
            stroke="#0f766e"
            strokeWidth={2}
            fill="#0f766e"
            fillOpacity={0.08} />
          
          <Area
            type="monotone"
            dataKey="dispensed"
            name="Dispensed (units)"
            stroke="#1d5ae3"
            strokeWidth={2}
            fill="#1d5ae3"
            fillOpacity={0.1} />
          
        </AreaChart>
      </ResponsiveContainer>
    </div>);

}