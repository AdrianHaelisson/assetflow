import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import { useFilteredData } from '../hooks/useFilteredData';
import { FilterBar } from './ui/FilterBar';
import { Pagination } from './ui/Pagination';

type ModalTab = 'details' | 'edit' | 'assets';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem', borderRadius: '8px',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  color: 'white', fontSize: '0.95rem', outline: 'none',
};
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' };

export const CollaboratorsTab = ({ viewCollaboratorId, onClearViewCollaborator }: { viewCollaboratorId?: string | null, onClearViewCollaborator?: () => void }) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newCollab, setNewCollab] = useState({ name: '', email: '' });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [userAssets, setUserAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const [filterRole, setFilterRole] = useState('');
  const [locations, setLocations] = useState<any[]>([]);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, location: filterLocation, setLocation: setFilterLocation,
    pageSize, setPageSize,
    reset: resetFiltersHook
  } = useFilteredData(collaborators, { pageSize: 12, searchKeys: ['name', 'email'] });

  const filteredByRole = filterRole ? paginated.filter((c: any) => c.role === filterRole) : paginated;

  const resetFilters = () => { resetFiltersHook(); setFilterRole(''); };

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        apiClient.get(`/users?companyId=${user?.companyId || 'comp1'}`),
        apiClient.get(`/locations?companyId=${user?.companyId || 'comp1'}`)
      ]);
      setCollaborators(cRes.data);
      setLocations(lRes.data);
    } catch {
      addToast({ type: 'error', message: 'Erro ao carregar colaboradores.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollabs(); }, []);

  useEffect(() => {
    if (viewCollaboratorId && collaborators.length > 0) {
      const targetUser = collaborators.find(c => c.id === viewCollaboratorId);
      if (targetUser) {
        openUserModal(targetUser);
        onClearViewCollaborator?.();
      }
    }
  }, [viewCollaboratorId, collaborators]);

  const openUserModal = async (user: any) => {
    setSelectedUser(user);
    setEditData({ name: user.name, email: user.email, role: user.role });
    setModalTab('details');
    setLoadingAssets(true);
    setUserAssets([]);
    try {
      const res = await apiClient.get(`/users/${user.id}/assets`);
      setUserAssets(res.data);
    } catch {
      console.error('Error fetching user assets');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(`/users/${selectedUser.id}`, editData);
      setCollaborators(c => c.map(u => u.id === selectedUser.id ? { ...u, ...res.data } : u));
      setSelectedUser({ ...selectedUser, ...res.data });
      addToast({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
      setModalTab('details');
    }
  };

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', { ...newCollab, role: 'EMPLOYEE', companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Colaborador cadastrado!' });
      fetchCollabs();
      setCreateModalOpen(false);
      setNewCollab({ name: '', email: '' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao cadastrar.' });
    }
  };

  const handleDeleteCollab = () => {
    confirm({
      title: 'Remover Colaborador',
      message: `Deseja realmente remover ${selectedUser.name}? Esta ação é irreversível.`,
      danger: true,
      onConfirm: async () => {
        try {
          await apiClient.delete(`/users/${selectedUser.id}`);
          addToast({ type: 'success', message: 'Colaborador removido.' });
          fetchCollabs();
          setSelectedUser(null);
        } catch {
          addToast({ type: 'error', message: 'Erro ao remover.' });
        }
      }
    });
  };

  const roleColors: Record<string, string> = {
    ADMIN: '#ef4444', MANAGER: '#f59e0b', TECHNICIAN: '#3b82f6', EMPLOYEE: '#10b981',
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Colaboradores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Quadro de Funcionários e Acessos — {collaborators.length} registros
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>+ Adicionar Ficha</button>
      </header>

      <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <FilterBar
          search={search} onSearch={setSearch}
          type={filterRole} onType={setFilterRole}
          typeOptions={['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE']}
          locationId={filterLocation} onLocation={setFilterLocation}
          locationOptions={locations}
          onReset={resetFilters}
        />
      </section>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', width: '420px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>👥 Cadastrar Funcionário</h2>
            <form onSubmit={handleCreateCollab}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Nome Completo</label>
                <input style={inputStyle} type="text" required value={newCollab.name} onChange={e => setNewCollab({ ...newCollab, name: e.target.value })} placeholder="Ex: João Silva" />
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Email Corporativo</label>
                <input style={inputStyle} type="email" required value={newCollab.email} onChange={e => setNewCollab({ ...newCollab, email: e.target.value })} placeholder="joao@empresa.com" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Perfil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ padding: '0', width: '560px', maxWidth: '95%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColors[selectedUser.role] || '#3b82f6'}, rgba(255,255,255,0.2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedUser.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedUser.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.6rem' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'assets', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => { setModalTab(tab); if (tab === 'edit') setEditData({ name: selectedUser.name, email: selectedUser.email, role: selectedUser.role }); }} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.95rem' }}>
                  {tab === 'details' ? '📋 Detalhes' : tab === 'assets' ? '📦 Ativos' : '✏️ Editar'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {modalTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {[
                    { label: 'Nome', value: selectedUser.name },
                    { label: 'Email', value: selectedUser.email },
                    { label: 'Cargo / Role', value: selectedUser.role },
                    { label: 'Cadastrado em', value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('pt-BR') : 'N/A' },
                    { label: 'Sede', value: selectedUser.locationName || 'Não informado' },
                    { label: 'Setor', value: selectedUser.departmentName || 'Não informado' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ ...labelStyle }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
              {modalTab === 'assets' && (
                <div>
                  {loadingAssets ? (
                    <div className="loading-state" style={{ height: '100px' }}>Carregando ativos...</div>
                  ) : userAssets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum ativo atribuído.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {userAssets.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{a.model}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tag: {a.tagNumber} • S/N: {a.serial}</div>
                          </div>
                          <span className={`badge badge-${a.status.toLowerCase().replace('_', '')}`} style={{ fontSize: '0.7rem' }}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {modalTab === 'edit' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Nome Completo</label>
                    <input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Email corporativo</label>
                    <input style={inputStyle} type="email" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={labelStyle}>Nível de Acesso</label>
                    <select style={{ ...inputStyle }} value={editData.role || ''} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                      {['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE'].map(r => <option key={r} value={r} style={{ background: '#1e1e2e' }}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={handleDeleteCollab} style={{ marginRight: 'auto', background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '0.7rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Excluir Perfil</button>
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
        {loading ? <div className="loading-state">Carregando...</div> : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Cargo</th>
                    <th>Ativos</th>
                    <th>Sede</th>
                    <th>Cadastro</th>
                    <th style={{ textAlign: 'right' }}>Gerenciar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByRole.map((collab, i) => (
                    <tr key={collab.id ?? i} style={{ cursor: 'pointer' }} onClick={() => openUserModal(collab)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColors[collab.role] || '#3b82f6'}, rgba(255,255,255,0.1))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                            {collab.name?.charAt(0)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{collab.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{collab.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: `${roleColors[collab.role]}15`, color: roleColors[collab.role], border: `1px solid ${roleColors[collab.role]}30`, fontWeight: 700, fontSize: '0.7rem' }}>
                          {collab.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: (collab.assetCount ?? 0) > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)', color: (collab.assetCount ?? 0) > 0 ? '#60a5fa' : 'var(--text-secondary)', border: `1px solid ${(collab.assetCount ?? 0) > 0 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          📦 {collab.assetCount ?? 0}
                        </span>
                      </td>
                      <td>
                        {collab.locationName ? (
                          <span
                            onClick={e => { e.stopPropagation(); const loc = locations.find((l: any) => l.name === collab.locationName); if (loc) setFilterLocation(loc.id); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: filterLocation && locations.find((l:any)=>l.id===filterLocation)?.name === collab.locationName ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '20px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                            title="Clique para filtrar por esta sede"
                          >
                            📍 {collab.locationName}
                          </span>
                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{collab.createdAt ? new Date(collab.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                      <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button className="action-link" onClick={() => openUserModal(collab)}>Ver Ficha</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={collaborators.length} pageSize={pageSize} />
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
              >
                {[10, 15, 20, 25, 45].map(n => <option key={n} value={n} style={{ background: '#1e1e2e' }}>{n} por página</option>)}
              </select>
            </div>
          </>
        )}
      </section>
    </>
  );
};

