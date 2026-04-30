import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useToastStore } from '../store/toastStore';

type ViewMode = 'locs' | 'deps';
type ModalTab = 'details' | 'edit' | 'residents';

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' };

export const LocationsTab = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('locs');
  const [locations, setLocations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', type: 'BRANCH' });
  const [newDepartment, setNewDepartment] = useState({ name: '', locationId: '' });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('details');
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [residents, setResidents] = useState<{ assets: any[], users: any[] }>({ assets: [], users: [] });
  const [loadingResidents, setLoadingResidents] = useState(false);

  const addToast = useToastStore(s => s.add);
  const companyId = 'comp1';

  const fetchData = async () => {
    try {
      const [lRes, dRes] = await Promise.all([
        apiClient.get(`/locations?companyId=${companyId}`),
        apiClient.get(`/departments?companyId=${companyId}`)
      ]);
      setLocations(lRes.data);
      setDepartments(dRes.data);
    } catch (err) {
      console.error('Error fetching locations/deps', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openDetails = async (item: any, type: 'loc' | 'dep') => {
    setSelectedItem({ ...item, _type: type });
    setEditData({ ...item });
    setModalTab('details');
    
    setLoadingResidents(true);
    try {
      if (type === 'loc') {
        const [aRes, uRes] = await Promise.all([
          apiClient.get(`/assets?companyId=${companyId}&locationId=${item.id}`),
          apiClient.get(`/users?companyId=${companyId}&locationId=${item.id}`)
        ]);
        setResidents({ assets: aRes.data, users: uRes.data });
      } else {
        const [aRes, uRes] = await Promise.all([
          apiClient.get(`/assets?companyId=${companyId}&departmentId=${item.id}`),
          apiClient.get(`/users?companyId=${companyId}&departmentId=${item.id}`)
        ]);
        setResidents({ assets: aRes.data, users: uRes.data });
      }
    } catch {
      setResidents({ assets: [], users: [] });
    }
    setLoadingResidents(false);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const endpoint = selectedItem._type === 'loc' ? `/locations/${selectedItem.id}` : `/departments/${selectedItem.id}`;
      await apiClient.put(endpoint, editData);
      addToast({ type: 'success', message: 'Atualizado com sucesso!' });
      fetchData();
      setSelectedItem({ ...selectedItem, ...editData });
    } catch {
      addToast({ type: 'error', message: 'Erro ao atualizar' });
    }
    setSaving(false);
    setModalTab('details');
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/locations', { ...newLocation, companyId });
      addToast({ type: 'success', message: 'Sede registrada!' });
      fetchData();
      setCreateModalOpen(false);
    } catch {
      addToast({ type: 'error', message: 'Erro ao registrar' });
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/departments', { ...newDepartment, companyId });
      addToast({ type: 'success', message: 'Setor criado!' });
      fetchData();
      setCreateModalOpen(false);
    } catch {
      addToast({ type: 'error', message: 'Erro ao criar setor' });
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Sedes e Setores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestão de Unidades Físicas e Departamentos Organizacionais</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
          {viewMode === 'locs' ? '+ Adicionar Sede' : '+ Novo Setor'}
        </button>
      </header>

      {/* VIEW TOGGLE */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '10px', width: 'fit-content' }}>
        <button onClick={() => setViewMode('locs')} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: viewMode === 'locs' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
          🏢 Sedes (Unidades)
        </button>
        <button onClick={() => setViewMode('deps')} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: viewMode === 'deps' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
          📂 Setores (Departamentos)
        </button>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '450px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{viewMode === 'locs' ? 'Cadastrar Nova Sede' : 'Novo Setor / Departamento'}</h2>
            
            {viewMode === 'locs' ? (
              <form onSubmit={handleCreateLocation}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>Nome da Unidade</label>
                  <input style={inputStyle} placeholder="Ex: Sede Aracaju" required value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Tipo</label>
                  <select style={inputStyle} value={newLocation.type} onChange={e => setNewLocation({ ...newLocation, type: e.target.value })}>
                    <option value="BRANCH" style={{ background: '#1e1e2e', color: 'white' }}>Sede / Filial</option>
                    <option value="OFFICE" style={{ background: '#1e1e2e', color: 'white' }}>Escritório Central</option>
                    <option value="STORAGE" style={{ background: '#1e1e2e', color: 'white' }}>Depósito / Estoque</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">Salvar Sede</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateDepartment}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>Nome do Setor</label>
                  <input style={inputStyle} placeholder="Ex: Departamento Fiscal" required value={newDepartment.name} onChange={e => setNewDepartment({ ...newDepartment, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Sede Principal</label>
                  <select style={inputStyle} value={newDepartment.locationId} onChange={e => setNewDepartment({ ...newDepartment, locationId: e.target.value })}>
                    <option value="" style={{ background: '#1e1e2e', color: 'white' }}>Selecione uma sede...</option>
                    {locations.map(l => <option key={l.id} value={l.id} style={{ background: '#1e1e2e', color: 'white' }}>{l.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">Criar Setor</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '0', width: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedItem._type === 'loc' ? '🏢' : '📂'} {selectedItem.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Identificador: {selectedItem.id}</div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {(['details', 'residents', 'edit'] as ModalTab[]).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} style={{ flex: 1, padding: '1rem', background: modalTab === tab ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', borderBottom: modalTab === tab ? '3px solid #3b82f6' : '3px solid transparent', color: modalTab === tab ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  {tab === 'details' ? '📋 Info' : tab === 'residents' ? '👥 Inventário/Time' : '✏️ Editar'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              {modalTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={labelStyle}>Nome</div>
                    <div style={{ fontWeight: 600 }}>{selectedItem.name}</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={labelStyle}>Tipo/Vínculo</div>
                    <div style={{ fontWeight: 600 }}>{selectedItem.type || 'Departamento Setorial'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', padding: '1rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: '0.9rem', color: '#93c5fd' }}>
                      📍 <strong>Localização Estratégica</strong>: Esta unidade concentra as operações de {selectedItem.name}. Use a aba "Inventário/Time" para ver ativos alocados aqui.
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'residents' && (
                <div>
                  {loadingResidents ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados da unidade...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div>
                        <h4 style={{ marginBottom: '1rem', color: '#60a5fa' }}>📦 Ativos na Unidade ({residents.assets.length})</h4>
                        {residents.assets.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nenhum ativo vinculado.</p> : (
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {residents.assets.map(a => (
                              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                <span>{a.model} <small style={{ color: 'var(--text-secondary)' }}>({a.tagNumber})</small></span>
                                <span style={{ fontSize: '0.8rem', color: '#34d399' }}>{a.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 style={{ marginBottom: '1rem', color: '#34d399' }}>👤 Time Alocado ({residents.users.length})</h4>
                        {residents.users.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nenhum colaborador vinculado.</p> : (
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {residents.users.map(u => (
                              <div key={u.id} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                {u.name} <small style={{ color: 'var(--text-secondary)' }}>- {u.email}</small>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={labelStyle}>Alterar Nome</label>
                    <input style={inputStyle} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  {selectedItem._type === 'dep' && (
                    <div>
                      <label style={labelStyle}>Vincular a outra Sede</label>
                      <select style={inputStyle} value={editData.locationId} onChange={e => setEditData({ ...editData, locationId: e.target.value })}>
                        {locations.map(l => <option key={l.id} value={l.id} style={{ background: '#1e1e2e', color: 'white' }}>{l.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={async () => {
                      if (!confirm('Tem certeza que deseja excluir?')) return;
                      try {
                        setSaving(true);
                        const endpoint = selectedItem._type === 'loc' ? `/locations/${selectedItem.id}` : `/departments/${selectedItem.id}`;
                        await apiClient.delete(endpoint);
                        addToast({ type: 'success', message: 'Excluído com sucesso!' });
                        setSelectedItem(null);
                        fetchData();
                      } catch {
                        addToast({ type: 'error', message: 'Erro ao excluir' });
                        setSaving(false);
                      }
                    }} disabled={saving} className="btn-danger" style={{ marginRight: 'auto' }}>
                      {saving ? 'Excluindo...' : 'Excluir'}
                    </button>
                    <button onClick={() => setModalTab('details')} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar Alterações'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {(viewMode === 'locs' ? locations : departments).map((item) => (
          <div key={item.id} className="glass-panel" onClick={() => openDetails(item, viewMode === 'locs' ? 'loc' : 'dep')}
            style={{ padding: '1.5rem', cursor: 'pointer', transition: '0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{viewMode === 'locs' ? '🏢' : '📂'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{item.type || 'DEPARTAMENTO'}</div>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{item.name}</h3>
            {viewMode === 'deps' && item.locationId && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                📍 {locations.find(l => l.id === item.locationId)?.name}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#60a5fa' }}>{item.assetCount ?? 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Equipamentos</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#34d399' }}>{item.userCount ?? 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Colaboradores</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
