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

export const AccessoriesTab = () => {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', quantity: 0, minQuantity: 0 });
  const [selectedAcc, setSelectedAcc] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, reset: resetFilters
  } = useFilteredData(accessories, { pageSize: 12 });

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/accessories?companyId=${user?.companyId || 'comp1'}`);
      setAccessories(res.data);
    } catch {
      addToast({ type: 'error', message: 'Erro ao carregar acessórios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccessories(); }, []);

  const openModal = (acc: any) => {
    setSelectedAcc(acc);
    setEditData({ name: acc.name, quantity: acc.quantity, minQuantity: acc.minQuantity });
    setModalTab('details');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(`/accessories/${selectedAcc.id}`, { ...editData, quantity: Number(editData.quantity), minQuantity: Number(editData.minQuantity) });
      setAccessories(a => a.map(x => x.id === selectedAcc.id ? { ...x, ...res.data } : x));
      setSelectedAcc({ ...selectedAcc, ...res.data });
      addToast({ type: 'success', message: 'Dados do acessório atualizados.' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
      setModalTab('details');
    }
  };

  const handleCheckout = async (id: string, quantity: number) => {
    if (quantity <= 0) return addToast({ type: 'error', message: 'Sem estoque para check-out!' });
    
    // In a premium app, we'd have a user selection modal
    const userId = prompt('Digite o ID do colaborador para o check-out:');
    if (!userId) return;

    confirm({
      title: 'Confirmar Atribuição',
      message: `Deseja entregar 1 unidade deste acessório para o colaborador ${userId}?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/accessories/${id}/checkout`, { userId });
          addToast({ type: 'success', message: 'Acessório atribuído com sucesso.' });
          fetchAccessories();
          setSelectedAcc(null);
        } catch {
          addToast({ type: 'error', message: 'Erro ao processar check-out.' });
        }
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/accessories', { ...newAcc, companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Novo modelo adicionado ao estoque!' });
      fetchAccessories();
      setCreateModalOpen(false);
      setNewAcc({ name: '', quantity: 0, minQuantity: 0 });
    } catch {
      addToast({ type: 'error', message: 'Erro ao cadastrar acessório.' });
    }
  };

  const getStatus = (qty: number, min: number) => {
    if (qty <= 0) return { label: 'Esgotado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    if (qty <= min) return { label: 'Baixo Estoque', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'Disponível', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Acessórios de TI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestão de periféricos e dispositivos reutilizáveis</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>+ Adicionar Modelo</button>
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
          <div className="glass-panel" style={{ padding: '2.5rem', width: '440px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>🖱️ Novo Periférico</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Modelo</label><input style={inputStyle} type="text" required value={newAcc.name} onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} placeholder="Ex: Mouse MX Master 3S" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div><label style={labelStyle}>Quant. Inicial</label><input style={inputStyle} type="number" min="0" required value={newAcc.quantity} onChange={e => setNewAcc({ ...newAcc, quantity: Number(e.target.value) })} /></div>
                <div><label style={labelStyle}>Mínimo Alerta</label><input style={inputStyle} type="number" min="0" value={newAcc.minQuantity} onChange={e => setNewAcc({ ...newAcc, minQuantity: Number(e.target.value) })} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Modelo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedAcc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '0', width: '520px', maxWidth: '95%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🖱️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedAcc.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestão de Inventário de Acessórios</div>
                </div>
              </div>
              <button onClick={() => setSelectedAcc(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.6rem' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.95rem' }}>
                  {tab === 'details' ? '📊 Estatísticas' : '✏️ Configurações'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {modalTab === 'details' && (() => {
                const st = getStatus(selectedAcc.quantity, selectedAcc.minQuantity);
                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ background: st.bg, borderRadius: '16px', padding: '1.75rem', textAlign: 'center', border: `1px solid ${st.color}30` }}>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: st.color }}>{selectedAcc.quantity}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Em Estoque</div>
                        <span className="badge" style={{ background: `${st.color}20`, color: st.color, border: `1px solid ${st.color}40`, marginTop: '10px' }}>{st.label}</span>
                      </div>
                      <div style={{ background: 'rgba(245,158,11,0.05)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fbbf24' }}>{selectedAcc.minQuantity}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Porto Seguro</div>
                         <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', marginTop: '10px' }}>Alerta de Compra</span>
                      </div>
                    </div>
                    <button onClick={() => handleCheckout(selectedAcc.id, selectedAcc.quantity)} disabled={selectedAcc.quantity <= 0} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                      {selectedAcc.quantity > 0 ? '📤 Registrar Entrega a Usuário' : '❌ Produto Indisponível em Estoque'}
                    </button>
                  </div>
                );
              })()}
              {modalTab === 'edit' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Acessório</label><input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div><label style={labelStyle}>Estoque Real</label><input style={inputStyle} type="number" min="0" value={editData.quantity || 0} onChange={e => setEditData({ ...editData, quantity: e.target.value })} /></div>
                    <div><label style={labelStyle}>Estoque Mínimo</label><input style={inputStyle} type="number" min="0" value={editData.minQuantity || 0} onChange={e => setEditData({ ...editData, minQuantity: e.target.value })} /></div>
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
        {loading ? <div className="loading-state">Consultando prateleiras...</div> : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Acessório / Periférico</th><th>Estoque</th><th>Mínimo</th><th>Status</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>
                  {paginated.map((item, i) => {
                    const st = getStatus(item.quantity, item.minQuantity);
                    return (
                      <tr key={item.id ?? i} style={{ cursor: 'pointer' }} onClick={() => openModal(item)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🖱️</span>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '1.1rem', fontWeight: 800, color: st.color }}>{item.quantity}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>unid</span></td>
                        <td><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.minQuantity}</span></td>
                        <td>
                           <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30`, fontWeight: 700, fontSize: '0.7rem' }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => openModal(item)} className="action-link">Gerenciar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={accessories.length} pageSize={12} />
          </>
        )}
      </section>
    </>
  );
};
