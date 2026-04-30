import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

interface Log {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  createdAt: string;
}

const actionLabel = (action: string, entity: string) => {
  const map: Record<string, string> = {
    CREATE: 'criou', UPDATE: 'atualizou', DELETE: 'excluiu', ASSIGN: 'atribuiu', RETURN: 'devolveu',
  };
  const verb = map[action] ?? action;
  return `${verb} ${entity.toLowerCase()}`;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dias`;
};

const entityIcon: Record<string, string> = {
  Asset: '🖥️', User: '👤', License: '📄', Accessory: '🖱️', Component: '🔩', Consumable: '📦',
};

const mockLogs: Log[] = [
  { id: '1', action: 'ASSIGN', entityType: 'Asset', entityId: 'MAC-001', userId: 'Ricardo Almeida', createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: '2', action: 'CREATE', entityType: 'Asset', entityId: 'DELL-005', userId: 'Fernanda Costa', createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: '3', action: 'UPDATE', entityType: 'License', entityId: 'Microsoft 365', userId: 'Ricardo Almeida', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '4', action: 'RETURN', entityType: 'Accessory', entityId: 'Headset Jabra', userId: 'Ana Beatriz Santos', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', action: 'CREATE', entityType: 'User', entityId: 'Diego Carvalho', userId: 'Sandro Ribeiro', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const ActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/logs')
      .then((r) => setLogs(r.data))
      .catch(() => setLogs(mockLogs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="activity-feed">
      <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        🕐 Atividade Recente
      </h3>
      {loading ? (
        [...Array(5)].map((_, i) => (
          <div key={i} style={{ height: '38px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }} />
        ))
      ) : logs.length === 0 ? (
        <p data-testid="feed-empty" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma atividade registrada.</p>
      ) : (
        <div style={{ borderLeft: '2px solid rgba(255,255,255,0.08)', paddingLeft: '1rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ position: 'relative', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ position: 'absolute', left: '-1.35rem', top: '0.3rem', width: '0.6rem', height: '0.6rem', background: '#6366f1', borderRadius: '50%' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                <span style={{ color: '#a78bfa' }}>{(log as any).userId || 'Sistema'}</span>
                {' '}{actionLabel(log.action, log.entityType)}{' '}
                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{log.entityId}</span>
                {' '}<span style={{ marginLeft: 4 }}>{entityIcon[log.entityType] ?? '📋'}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                {timeAgo(log.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
