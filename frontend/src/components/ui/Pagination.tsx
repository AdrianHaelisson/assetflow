import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPage, totalItems, pageSize = 20 }) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems ?? page * pageSize);

  return (
    <div
      data-testid="pagination"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', gap: '0.5rem' }}
    >
      {totalItems != null && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Exibindo {from}–{to} de {totalItems}
        </span>
      )}
      <div style={{ display: 'flex', gap: '0.3rem', marginLeft: 'auto' }}>
        <button
          onClick={() => onPage(1)} disabled={page === 1}
          style={btnStyle(page === 1)}
        >«</button>
        <button
          onClick={() => onPage(page - 1)} disabled={page === 1}
          style={btnStyle(page === 1)}
        >‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} style={{ padding: '0.4rem 0.4rem', color: 'var(--text-secondary)' }}>…</span>
            ) : (
              <button key={p} onClick={() => onPage(p as number)} style={btnStyle(false, p === page)}>{p}</button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)} disabled={page === totalPages}
          style={btnStyle(page === totalPages)}
        >›</button>
        <button
          onClick={() => onPage(totalPages)} disabled={page === totalPages}
          style={btnStyle(page === totalPages)}
        >»</button>
      </div>
    </div>
  );
};

const btnStyle = (disabled: boolean, active?: boolean): React.CSSProperties => ({
  padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none',
  background: active ? 'var(--accent-primary)' : disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
  color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: active ? 700 : 500, fontSize: '0.9rem',
  transition: 'background 0.2s',
});
