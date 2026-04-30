import React from 'react';

interface Stat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  sub?: string;
}

interface StatsCardsProps {
  data?: {
    total: number;
    inUse: number;
    available: number;
    maintenance: number;
    retired: number;
    totalValue: number;
  };
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ data, loading }) => {
  const stats: Stat[] = [
    {
      label: 'Total de Ativos',
      value: loading ? '—' : (data?.total ?? 0),
      icon: '🖥️',
      color: '#60a5fa',
      bg: 'rgba(59,130,246,0.12)',
      sub: 'equipamentos cadastrados',
    },
    {
      label: 'Em Uso',
      value: loading ? '—' : (data?.inUse ?? 0),
      icon: '👤',
      color: '#fbbf24',
      bg: 'rgba(245,158,11,0.12)',
      sub: `${data && data.total ? Math.round((data.inUse / data.total) * 100) : 0}% do parque`,
    },
    {
      label: 'Disponíveis',
      value: loading ? '—' : (data?.available ?? 0),
      icon: '✅',
      color: '#34d399',
      bg: 'rgba(16,185,129,0.12)',
      sub: 'prontos para uso',
    },
    {
      label: 'Em Manutenção',
      value: loading ? '—' : (data?.maintenance ?? 0),
      icon: '🔧',
      color: '#f87171',
      bg: 'rgba(239,68,68,0.12)',
      sub: 'aguardando reparo',
    },
    {
      label: 'Valor do Parque',
      value: loading ? '—' : `R$ ${(data?.totalValue ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      icon: '💰',
      color: '#a78bfa',
      bg: 'rgba(124,58,237,0.12)',
      sub: 'patrimônio total',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} data-testid="skeleton-card" className="glass-panel" style={{ padding: '1.5rem', height: '120px', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid="stats-cards"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass-panel"
          style={{ padding: '1.5rem', background: s.bg, border: `1px solid ${s.color}33`, transition: 'transform 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{s.icon}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontWeight: 600, marginTop: '0.3rem' }}>{s.label}</div>
          {s.sub && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
};
