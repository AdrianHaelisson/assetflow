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

export const LicensesTab = () => {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({ name: '', totalSeats: 1, isPerpetual: true, expirationDate: '' });
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, reset: resetFilters
  } = useFilteredData(licenses, { pageSize: 12 });

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/licenses?companyId=${user?.companyId || 'comp1'}`);
      setLicenses(res.data);
    } catch {
      addToast({ type: 'error', message: 'Erro ao carregar licenças.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLicenses(); }, []);

  const openModal = (lic: any) => {
    setSelectedLicense(lic);
    setEditData({ 
      name: lic.name, 
      totalSeats: lic.totalSeats, 
      isPerpetual: lic.isPerpetual, 
      expirationDate: lic.expirationDate ? lic.expirationDate.split('T')[0] : '' 
    });
    setModalTab('details');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = { 
        ...editData, 
        totalSeats: Number(editData.totalSeats), 
        expirationDate: editData.isPerpetual ? null : (editData.expirationDate ? new Date(editData.expirationDate) : null) 
      };
      const res = await apiClient.put(`/licenses/${selectedLicense.id}`, payload);
      setLicenses(l => l.map(x => x.id === selectedLicense.id ? { ...x, ...res.data } : x));
      setSelectedLicense({ ...selectedLicense, ...res.data });
      addToast({ type: 'success', message: 'Configurações de licença salvas.' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
      setModalTab('details');
    }
  };

  const handleAssignLicense = (id: string) => {
    // For now using simple prompt, but in a real app this would be a modal
    const userId = prompt('Digite o ID do usuário para atribuir a licença:');
    if (!userId) return;
    
    confirm({
      title: 'Atribuir Licença',
      message: `Deseja atribuir um assento deste software para o usuário ${userId}?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/licenses/${id}/assign`, { userId });
          addToast({ type: 'success', message: 'Licença atribuída com sucesso!' });
          fetchLicenses();
          setSelectedLicense(null);
        } catch {
          addToast({ type: 'error', message: 'Erro ao atribuir licença. Verifique o ID do usuário.' });
        }
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/licenses', { ...newLicense, companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Novo software cadastrado!' });
      fetchLicenses();
      setCreateModalOpen(false);
      setNewLicense({ name: '', totalSeats: 1, isPerpetual: true, expirationDate: '' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao cadastrar licença.' });
    }
  };

  const softwareIcons: Record<string, string> = { 'Microsoft': '🪟', 'Adobe': '🎨', 'Slack': '💬', 'GitHub': '🐙', 'Zoom': '📹', 'JetBrains': '🧠', 'Docker': '🐋', 'Figma': '📐' };
  const getIcon = (name: string) => { for (const [key, icon] of Object.entries(softwareIcons)) { if (name?.includes(key)) return icon; } return '📦'; };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Licenças de Software</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestão de assinaturas, seats e conformidade de software</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>+ Cadastrar Software</button>
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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>🚀 Adicionar Licença</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Software</label><input style={inputStyle} type="text" required value={newLicense.name} onChange={e => setNewLicense({ ...newLicense, name: e.target.value })} placeholder="Ex: Microsoft 365" /></div>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Total de Assentos (Seats)</label><input style={inputStyle} type="number" min="1" required value={newLicense.totalSeats} onChange={e => setNewLicense({ ...newLicense, totalSeats: Number(e.target.value) })} /></div>
              <div style={{ marginBottom: '1.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <input type="checkbox" id="perpetual" checked={newLicense.isPerpetual} onChange={e => setNewLicense({ ...newLicense, isPerpetual: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="perpetual" style={{ color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Licença Perpétua (Sem validade)</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Licença</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedLicense && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '0', width: '580px', maxWidth: '95%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{getIcon(selectedLicense.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedLicense.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {selectedLicense.isPerpetual ? '✅ Ativo (Perpétuo)' : `⏳ Vencimento: ${selectedLicense.expirationDate ? new Date(selectedLicense.expirationDate).toLocaleDateString('pt-BR') : 'Sem data'}`}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedLicense(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.6rem' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.95rem' }}>
                  {tab === 'details' ? '📊 Dashboard' : '✏️ Editar'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {modalTab === 'details' && (() => {
                const used = selectedLicense.assignments?.length || 0;
                const free = Math.max(0, selectedLicense.totalSeats - used);
                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>{selectedLicense.totalSeats}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Total</div>
                      </div>
                      <div style={{ background: 'rgba(248,113,113,0.1)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(248,113,113,0.2)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>{used}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Em Uso</div>
                      </div>
                      <div style={{ background: free > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: `1px solid ${free > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: free > 0 ? '#34d399' : '#f87171' }}>{free}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Livres</div>
                      </div>
                    </div>
                    
                    <div className="table-container" style={{ maxHeight: '200px', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '0.5rem' }}>
                       <div style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Atribuições Ativas:</div>
                       {selectedLicense.assignments?.length > 0 ? (
                         <table className="data-table" style={{ fontSize: '0.9rem' }}>
                           <tbody>
                             {selectedLicense.assignments.map((a: any, i: number) => (
                               <tr key={i}>
                                 <td>👤 {a.user?.name || a.userId}</td>
                                 <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{new Date(a.assignedAt).toLocaleDateString('pt-BR')}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       ) : (
                         <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum usuário atribuído.</div>
                       )}
                    </div>

                    <button onClick={() => handleAssignLicense(selectedLicense.id)} disabled={free <= 0} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                      {free > 0 ? '➕ Atribuir Seat a Colaborador' : '⚠️ Todos os assentos estão em uso'}
                    </button>
                  </div>
                );
              })()}
              {modalTab === 'edit' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Nome do Software</label><input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                  <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>Total de Assentos</label><input style={inputStyle} type="number" min="1" value={editData.totalSeats || 1} onChange={e => setEditData({ ...editData, totalSeats: Number(e.target.value) })} /></div>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                    <input type="checkbox" id="edit-perpetual" checked={editData.isPerpetual} onChange={e => setEditData({ ...editData, isPerpetual: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="edit-perpetual" style={{ color: 'white', fontWeight: 600 }}>Licença Perpétua</label>
                  </div>
                  {!editData.isPerpetual && <div style={{ marginBottom: '2rem' }}><label style={labelStyle}>Data de Vencimento</label><input style={inputStyle} type="date" value={editData.expirationDate || ''} onChange={e => setEditData({ ...editData, expirationDate: e.target.value })} /></div>}
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
        {loading ? <div className="loading-state">Consultando compliance...</div> : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Software</th><th>Tipo</th><th>Disponibilidade</th><th>Vencimento</th><th style={{ textAlign: 'right' }}>Gerenciar</th></tr>
                </thead>
                <tbody>
                  {paginated.map((lic, i) => {
                    const used = lic.assignments?.length || 0;
                    const free = Math.max(0, lic.totalSeats - used);
                    return (
                      <tr key={lic.id ?? i} style={{ cursor: 'pointer' }} onClick={() => openModal(lic)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <span style={{ fontSize: '1.5rem' }}>{getIcon(lic.name)}</span>
                             <span style={{ fontWeight: 600 }}>{lic.name}</span>
                          </div>
                        </td>
                        <td>
                          {lic.isPerpetual ? 
                            <span className="badge" style={{ background: '#7c3aed15', color: '#a78bfa', border: '1px solid #7c3aed30', fontSize: '0.7rem', fontWeight: 700 }}>PERPÉTUA</span> : 
                            <span className="badge" style={{ background: '#0ea5e915', color: '#38bdf8', border: '1px solid #0ea5e930', fontSize: '0.7rem', fontWeight: 700 }}>ASSINATURA</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${(used / lic.totalSeats) * 100}%`, height: '100%', background: (used / lic.totalSeats) > 0.9 ? '#ef4444' : '#3b82f6' }}></div>
                            </div>
                            <span style={{ color: free > 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>{free}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>livres de {lic.totalSeats}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{lic.isPerpetual ? '∞ Permanente' : (lic.expirationDate ? new Date(lic.expirationDate).toLocaleDateString('pt-BR') : '—')}</td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button className="action-link" onClick={() => openModal(lic)}>Ver seats</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={licenses.length} pageSize={12} />
          </>
        )}
      </section>
    </>
  );
};
