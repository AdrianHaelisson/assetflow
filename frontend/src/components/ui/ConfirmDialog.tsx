import React from 'react';
import { useConfirmStore } from '../../store/confirmStore';

export const ConfirmDialog: React.FC = () => {
  const { isOpen, title, message, confirmLabel, cancelLabel, danger, onConfirm, close } = useConfirmStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    close();
  };

  return (
    <div
      data-testid="confirm-overlay"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9998, backdropFilter: 'blur(4px)',
      }}
      onClick={close}
    >
      <div
        data-testid="confirm-dialog"
        className="glass-panel"
        style={{ padding: '2rem', width: '420px', maxWidth: '95%', animation: 'fadeIn .15s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: danger ? '2rem' : '1.8rem', marginBottom: '0.75rem' }}>
          {danger ? '🗑️' : '❓'}
        </div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            data-testid="confirm-cancel"
            onClick={close}
            style={{
              background: 'transparent', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px', padding: '0.65rem 1.3rem',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            {cancelLabel}
          </button>
          <button
            data-testid="confirm-ok"
            onClick={handleConfirm}
            style={{
              background: danger ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,var(--accent-primary),#818cf8)',
              color: 'white', border: 'none',
              borderRadius: '6px', padding: '0.65rem 1.3rem',
              cursor: 'pointer', fontWeight: 600,
              boxShadow: danger ? '0 4px 15px rgba(239,68,68,0.4)' : '0 4px 15px rgba(99,102,241,0.4)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
