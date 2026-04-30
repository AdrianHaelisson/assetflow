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

export const ComponentsTab = () => {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', quantity: 1, serial: '' });
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, reset: resetFilters
  } = useFilteredData(components, { pageSize: 12 });

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/components?companyId=${user?.companyId || 'comp1'}`);
      setComponents(res.data);
    } catch {
      addToast({ type: 'error', message: 'Erro ao carregar componentes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComponents(); }, []);

  const openModal = (comp: any) => {
    setSelectedComp(comp);
    setEditData({ name: comp.name, quantity: comp.quantity, serial: comp.serial || '' });
    setModalTab('details');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(`/components/${selectedComp.id}`, { ...editData, quantity: Number(editData.quantity) });
      setComponents(c => c.map(x => x.id === selectedComp.id ? { ...x, ...res.data } : x));
      setSelectedComp({ ...selectedComp, ...res.data });
      addToast({ type: 'success', message: 'Componente atualizado.' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
      setModalTab('details');
    }
  };

  const handleInstall = (id: string, quantity: number) => {
    if (quantity <= 0) return addToast({ type: 'error', message: 'Sem peças em estoque!' });
    const assetId = prompt('Digite o ID do ativo para instalação:');
    if (!assetId) return;

    confirm({
      title: 'Confirmar Instalação',
      message: `Deseja registrar a instalação de 1 unidade deste componente no ativo ${assetId}?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/components/${id}/install`, { assetId });
          addToast({ type: 'success', message: 'Instalação registrada com sucesso!' });
          fetchComponents();
          setSelectedComp(null);
        } catch {
          addToast({ type: 'error', message: 'Erro ao registrar instalação.' });
        }
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/components', { ...newComp, companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Peça adicionada ao inventário!' });
      fetchComponents();
      setCreateModalOpen(false);
      setNewComp({ name: '', quantity: 1, serial: '' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao cadastrar componente.' });
    }
  };

  const compIcon = (name: string) => { 
    if (name?.includes('RAM') || name?.includes('Memória')) return '🧩'; 
    if (name?.includes('SSD') || name?.includes('HD') || name?.includes('Disco')) return '💾'; 
    if (name?.includes('Placa') || name?.includes('Rede') || name?.includes('GPU')) return '🌐'; 
    if (name?.includes('Fonte') || name?.includes('Bateria')) return '⚡'; 
    if (name?.includes('Processador') || name?.includes('CPU')) return '🧠';
    return '🔩'; 
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Gestão de Componentes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gerenciamento de peças e hardware modular</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>+ Cadastrar Peça</button>
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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>🔩 Inserir Hardware</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Componente</label><input style={inputStyle} placeholder="Ex: SSD NVMe 1TB" type="text" required value={newComp.name} onChange={e => setNewComp({ ...newComp, name: e.target.value })} /></div>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>P/N ou Serial</label><input style={inputStyle} placeholder="Opcional" type="text" value={newComp.serial} onChange={e => setNewComp({ ...newComp, serial: e.target.value })} /></div>
              <div style={{ marginBottom: '1.75rem' }}><label style={labelStyle}>Quantidade Inicial</label><input style={inputStyle} type="number" min="1" required value={newComp.quantity} onChange={e => setNewComp({ ...newComp, quantity: Number(e.target.value) })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Componente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedComp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '0', width: '520px', maxWidth: '95%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{compIcon(selectedComp.name)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedComp.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>PN: {selectedComp.serial || 'N/A'}</div>
                </div>
              </div>
              <button onClick={() => setSelectedComp(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.6rem' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.95rem' }}>
                  {tab === 'details' ? '📊 Dados' : '✏️ Ajustar'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {modalTab === 'details' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(59,130,246,0.2)', gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{selectedComp.quantity}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>Unidades para Instalação</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={labelStyle}>Número de Série</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>{selectedComp.serial || 'Não informado'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={labelStyle}>Status</div>
                      <div style={{ fontWeight: 700, color: selectedComp.quantity > 0 ? '#10b981' : '#ef4444' }}>{selectedComp.quantity > 0 ? '✓ DISPONÍVEL' : '✗ ESGOTADO'}</div>
                    </div>
                  </div>
                  <button onClick={() => handleInstall(selectedComp.id, selectedComp.quantity)} disabled={selectedComp.quantity <= 0} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                    🔧 Instalar em Ativo (Deploy)
                  </button>
                </div>
              )}
              {modalTab === 'edit' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Componente</label><input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Número de Série</label><input style={inputStyle} value={editData.serial || ''} onChange={e => setEditData({ ...editData, serial: e.target.value })} /></div>
                  <div style={{ marginBottom: '2rem' }}><label style={labelStyle}>Estoque Físico</label><input style={inputStyle} type="number" min="0" value={editData.quantity || 0} onChange={e => setEditData({ ...editData, quantity: e.target.value })} /></div>
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
        {loading ? <div className="loading-state">Consultando estoque de peças...</div> : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Hardware</th><th>Part Number / Serial</th><th>Estoque Disponível</th><th style={{ textAlign: 'right' }}>Gerenciar</th></tr></thead>
                <tbody>
                  {paginated.map((comp, i) => (
                    <tr key={comp.id ?? i} style={{ cursor: 'pointer' }} onClick={() => openModal(comp)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.6rem' }}>{compIcon(comp.name)}</span>
                          <span style={{ fontWeight: 600 }}>{comp.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{comp.serial || '—'}</td>
                      <td><span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>{comp.quantity}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>unid</span></td>
                      <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openModal(comp)} className="action-link">Detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={components.length} pageSize={12} />
          </>
        )}
      </section>
    </>
  );
};
