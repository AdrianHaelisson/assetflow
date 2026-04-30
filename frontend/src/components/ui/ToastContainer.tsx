import React, { useEffect, useState } from 'react';
import { useToastStore } from '../../store/toastStore';
import type { Toast, ToastType } from '../../store/toastStore';

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
  error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#f87171' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  info:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
};

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const remove = useToastStore((s) => s.remove);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const c = colors[toast.type];

  return (
    <div
      role="alert"
      data-testid={`toast-${toast.type}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: '10px', padding: '0.9rem 1.2rem',
        minWidth: '280px', maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
      }}
      onClick={() => remove(toast.id)}
    >
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icons[toast.type]}</span>
      <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{toast.message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); remove(toast.id); }}
        style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        zIndex: 9999, pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
};
