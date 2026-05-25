'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  type?: 'area' | 'bar';
}

export function RevenueChart({ data, type = 'area' }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-zinc-50 rounded-xl flex items-center justify-center animate-pulse border border-zinc-200">
        <span className="text-xs text-zinc-400">Cargando gráficos...</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-zinc-900 border border-zinc-200 p-3 rounded-xl text-[11px] font-sans shadow-lg">
          <p className="font-bold text-zinc-400 mb-0.5">{label}</p>
          <p className="text-[#4f46e5] font-bold">
            Total: S/ {parseFloat(payload[0].value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `S/ ${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
