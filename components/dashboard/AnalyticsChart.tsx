'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface AnalyticsChartProps {
  data: { name: string; count: number }[]
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'var(--accent-blue)' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--accent-blue)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
