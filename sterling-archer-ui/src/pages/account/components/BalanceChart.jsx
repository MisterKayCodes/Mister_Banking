import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BalanceChart = ({ data = [], currency = 'USD' }) => {
  // Create a formatter to handle the labels inside the chart hover
  const formatValue = (value) => {
    if (currency === 'BTC') return `${value.toFixed(4)} BTC`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Balance Over Time</h3>
          <p className="text-sm text-muted-foreground">Performance Trend</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              hide={true}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), 'Balance']}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--color-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBalance)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;