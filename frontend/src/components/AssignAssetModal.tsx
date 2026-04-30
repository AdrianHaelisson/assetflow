import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useToastStore } from '../store/toastStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignAssetModalProps {
  asset: { id: string; model: string; tagNumber: string };
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignAssetModal: React.FC<AssignAssetModalProps> = ({ asset, onClose, onAssigned }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.add);

  useEffect(() => {
    apiClient.get('/users?companyId=comp1')
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!selected) {
      addToast({ type: 'warning', message: 'Selecione um colaborador.' });
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(`/assets/${asset.id}/assign`, { userId: selected });
      addToast({ type: 'success', message: `Ativo "${asset.model}" atribuído com sucesso!` });
      onAssigned();
      onClose();
    } catch {
      addToast({ type: 'error', message: 'Erro ao atribuir ativo. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-testid="assign-modal-overlay"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        data-testid="assign-modal"
        style={{ padding: '2rem', width: '480px', maxWidth: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>👤 Atribuir Ativo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700 }}>{asset.model}</div>
          <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TAG: {asset.tagNumber}</div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            Colaborador
          </label>
          {loading ? (
            <div data-testid="users-loading" style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>⏳ Carregando colaboradores...</div>
          ) : (
            <select
              data-testid="user-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem', outline: 'none' }}
            >
              <option value="" style={{ background: '#1e1e2e' }}>Selecione um colaborador...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} style={{ background: '#1e1e2e' }}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem 1.2rem', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button
            data-testid="confirm-assign"
            onClick={handleAssign}
            disabled={saving || loading}
            className="btn-primary"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Atribuindo...' : '✅ Confirmar Atribuição'}
          </button>
        </div>
      </div>
    </div>
  );
};
