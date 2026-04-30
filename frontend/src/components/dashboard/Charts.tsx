import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface AssetStatusChartProps {
  data?: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#34d399',
  IN_USE: '#fbbf24',
  MAINTENANCE: '#f87171',
  RETIRED: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Baixado',
};

export const AssetStatusChart: React.FC<AssetStatusChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        data-testid="chart-empty"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}
      >
        📊 Sem dados para exibir
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? '#6366f1',
  }));

  return (
    <div data-testid="asset-status-chart">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
            formatter={(val: number) => [`${val} ativos`, '']}
          />
          <Legend
            formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MovementData {
  month: string;
  checkouts: number;
  checkins: number;
}

interface MovementTimelineProps {
  data?: MovementData[];
}

export const MovementTimeline: React.FC<MovementTimelineProps> = ({ data }) => {
  const fallback: MovementData[] = [
    { month: 'Nov', checkouts: 3, checkins: 1 },
    { month: 'Dez', checkouts: 5, checkins: 2 },
    { month: 'Jan', checkouts: 8, checkins: 3 },
    { month: 'Fev', checkouts: 6, checkins: 4 },
    { month: 'Mar', checkouts: 11, checkins: 5 },
    { month: 'Abr', checkouts: 7, checkins: 3 },
  ];

  return (
    <div data-testid="movement-timeline">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data ?? fallback} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
          />
          <Legend formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{val}</span>} />
          <Bar dataKey="checkouts" name="Check-outs" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="checkins"  name="Check-ins"  fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
