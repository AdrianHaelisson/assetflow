import React from 'react';

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  type?: string;
  onType?: (v: string) => void;
  typeOptions?: string[];
  status?: string;
  onStatus?: (v: string) => void;
  statusOptions?: string[];
  locationId?: string;
  onLocation?: (v: string) => void;
  locationOptions?: { id: string; name: string }[];
  departmentId?: string;
  onDepartment?: (v: string) => void;
  departmentOptions?: { id: string; name: string }[];
  onReset?: () => void;
  placeholder?: string;
}

const selectStyle: React.CSSProperties = {
  padding: '0.6rem 0.9rem', borderRadius: '7px',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  color: 'white', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
};
const inputStyle: React.CSSProperties = {
  padding: '0.6rem 1rem', borderRadius: '7px',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  color: 'white', fontSize: '0.88rem', outline: 'none', minWidth: '240px',
};

const ENUM_MAP: Record<string, string> = {
  AVAILABLE: 'Livre',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Baixado',
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software'
};

export const FilterBar: React.FC<FilterBarProps> = ({
  search, onSearch, type, onType, typeOptions = [],
  status, onStatus, statusOptions = [], 
  locationId, onLocation, locationOptions = [],
  departmentId, onDepartment, departmentOptions = [],
  onReset, placeholder = '🔍 Buscar...',
}) => {
  const hasFilters = search || type || status || locationId || departmentId;

  return (
    <div
      data-testid="filter-bar"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem' }}
    >
      <input
        data-testid="search-input"
        type="text" placeholder={placeholder}
        style={inputStyle} value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      {typeOptions.length > 0 && (
        <select style={selectStyle} value={type} onChange={(e) => onType?.(e.target.value)}>
          <option value="" style={{ background: '#1e1e2e' }}>Categorias</option>
          {typeOptions.map((t) => (
            <option key={t} value={t} style={{ background: '#1e1e2e' }}>{ENUM_MAP[t] || t}</option>
          ))}
        </select>
      )}

      {statusOptions.length > 0 && (
        <select style={selectStyle} value={status} onChange={(e) => onStatus?.(e.target.value)}>
          <option value="" style={{ background: '#1e1e2e' }}>Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s} style={{ background: '#1e1e2e' }}>{ENUM_MAP[s] || s}</option>
          ))}
        </select>
      )}

      {locationOptions.length > 0 && (
        <select style={selectStyle} value={locationId} onChange={(e) => onLocation?.(e.target.value)}>
          <option value="" style={{ background: '#1e1e2e' }}>Todas as Sedes</option>
          {locationOptions.map((l) => (
            <option key={l.id} value={l.id} style={{ background: '#1e1e2e' }}>{l.name}</option>
          ))}
        </select>
      )}

      {departmentOptions.length > 0 && (
        <select style={selectStyle} value={departmentId} onChange={(e) => onDepartment?.(e.target.value)}>
          <option value="" style={{ background: '#1e1e2e' }}>Todos os Setores</option>
          {departmentOptions.map((d) => (
            <option key={d.id} value={d.id} style={{ background: '#1e1e2e' }}>{d.name}</option>
          ))}
        </select>
      )}

      {hasFilters && onReset && (
        <button
          data-testid="reset-filters"
          onClick={onReset}
          style={{ padding: '0.6rem 1rem', borderRadius: '7px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          ✕ Limpar
        </button>
      )}
    </div>
  );
};
