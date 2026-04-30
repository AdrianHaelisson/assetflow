import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import { useFilteredData } from '../hooks/useFilteredData';
import { FilterBar } from './ui/FilterBar';
import { Pagination } from './ui/Pagination';

type ModalTab = 'details' | 'edit';
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem', outline: 'none' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' };

export const ConsumablesTab = () => {
  const [consumables, setConsumables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newConsumable, setNewConsumable] = useState({ name: '', quantity: 0 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, reset: resetFilters
  } = useFilteredData(consumables, { pageSize: 12 });

  const fetchConsumables = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/consumables?companyId=${user?.companyId || 'comp1'}`);
      setConsumables(res.data);
    } catch {
      addToast({ type: 'error', message: 'Erro ao carregar suprimentos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsumables(); }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setEditData({ name: item.name, quantity: item.quantity });
    setModalTab('details');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(`/consumables/${selectedItem.id}`, { ...editData, quantity: Number(editData.quantity) });
      setConsumables(c => c.map(x => x.id === selectedItem.id ? { ...x, ...res.data } : x));
      setSelectedItem({ ...selectedItem, ...res.data });
      addToast({ type: 'success', message: 'Estoque atualizado!' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao atualizar suprimento.' });
    } finally {
      setSaving(false);
      setModalTab('details');
    }
  };

  const handleCheckout = async (id: string, currentQuantity: number) => {
    if (currentQuantity <= 0) return addToast({ type: 'error', message: 'Sem estoque disponível!' });
    
    confirm({
      title: 'Confirmar Retirada',
      message: `Deseja registrar a retirada de 1 unidade deste item?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/consumables/${id}/checkout`, { userId: user?.id });
          setConsumables(c => c.map(x => x.id === id ? { ...x, quantity: x.quantity - 1 } : x));
          if (selectedItem?.id === id) setSelectedItem((s: any) => ({ ...s, quantity: s.quantity - 1 }));
          addToast({ type: 'success', message: 'Retirada registrada com sucesso.' });
        } catch {
          addToast({ type: 'error', message: 'Erro ao processar retirada.' });
        }
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/consumables', { ...newConsumable, companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Suprimento registrado!' });
      fetchConsumables();
      setCreateModalOpen(false);
      setNewConsumable({ name: '', quantity: 0 });
    } catch {
      addToast({ type: 'error', message: 'Erro ao registrar suprimento.' });
    }
  };

  const itemIcon = (name: string) => {
    if (name?.includes('Toner') || name?.includes('Impressora')) return '🖨️';
    if (name?.includes('Papel') || name?.includes('Resma')) return '📄';
    if (name?.includes('Mouse')) return '🖱️';
    if (name?.includes('Cabo')) return '🔌';
    if (name?.includes('Pen Drive') || name?.includes('USB')) return '🗂️';
    if (name?.includes('Álcool') || name?.includes('Pasta')) return '🧪';
    return '📦';
  };

  const stockStatus = (qty: number) => {
    if (qty <= 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Esgotado' };
    if (qty <= 10) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Crítico' };
    return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Disponível' };
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Gestão de Consumíveis</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Estoque de suprimentos descartáveis e escritório</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>+ Adicionar Estoque</button>
      </header>

      <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <FilterBar
          search={search} onSearch={setSearch}
          onReset={resetFilters}
        />
      </section>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', width: '420px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>📦 Receber Suprimento</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Suprimento</label><input style={inputStyle} type="text" required value={newConsumable.name} onChange={e => setNewConsumable({ ...newConsumable, name: e.target.value })} placeholder="Ex: Toner HP 26A" /></div>
              <div style={{ marginBottom: '1.75rem' }}><label style={labelStyle}>Quantidade Entrada</label><input style={inputStyle} type="number" min="1" required value={newConsumable.quantity} onChange={e => setNewConsumable({ ...newConsumable, quantity: Number(e.target.value) })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Estoque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '0', width: '480px', maxWidth: '95%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.2rem' }}>{itemIcon(selectedItem.name)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedItem.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Inventário de Consumíveis</div>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.6rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}>
                  {tab === 'details' ? '📊 Estoque' : '✏️ Ajustar'}
                </button>
              ))}
            </div>
            <div style={{ padding: '2rem' }}>
              {modalTab === 'details' && (() => {
                const st = stockStatus(selectedItem.quantity);
                return (
                  <div>
                    <div style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                      <div style={{ fontSize: '4rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{selectedItem.quantity}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 600 }}>unidades físicas</div>
                      <span style={{ display: 'inline-block', marginTop: '1rem', padding: '0.25rem 1rem', borderRadius: '999px', background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{st.label}</span>
                    </div>
                    <button onClick={() => handleCheckout(selectedItem.id, selectedItem.quantity)} disabled={selectedItem.quantity <= 0} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                      📤 Registrar Retirada (Check-out)
                    </button>
                  </div>
                );
              })()}
              {modalTab === 'edit' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Suprimento</label><input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={labelStyle}>Inventário Físico Atual</label>
                    <input style={inputStyle} type="number" min="0" value={editData.quantity || 0} onChange={e => setEditData({ ...editData, quantity: e.target.value })} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Utilize para ajuste manual após conferência física de estoque.</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setModalTab('details')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.7rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                    <button onClick={handleSaveEdit} disabled={saving} className="btn-primary" style={{ padding: '0.7rem 1.5rem' }}>{saving ? 'Gravando...' : 'Salvar Alterações'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? <div className="loading-state">Consultando estoque...</div> : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Suprimento</th><th>Quantidade</th><th>Status</th><th style={{ textAlign: 'right' }}>Ação Rápida</th></tr></thead>
                <tbody>
                  {paginated.map((item, index) => {
                    const st = stockStatus(item.quantity);
                    return (
                      <tr key={item.id ?? index} style={{ cursor: 'pointer' }} onClick={() => openModal(item)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{itemIcon(item.name)}</span>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '1.1rem', fontWeight: 700, color: st.color }}>{item.quantity}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Unidades</span></td>
                        <td>
                           <span className="badge" style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30`, fontWeight: 700, fontSize: '0.7rem' }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleCheckout(item.id, item.quantity)} disabled={item.quantity <= 0} className="action-link" style={{ color: item.quantity > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>Retirar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={consumables.length} pageSize={12} />
          </>
        )}
      </section>
    </>
  );
};
