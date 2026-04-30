import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import { FilterBar } from './ui/FilterBar';
import { Pagination } from './ui/Pagination';
import { AssignAssetModal } from './AssignAssetModal';
import { useFilteredData } from '../hooks/useFilteredData';

export const AssetsTab = ({ onViewCollaborator }: { onViewCollaborator?: (id: string) => void }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assetModalTab, setAssetModalTab] = useState<'details' | 'history' | 'edit'>('details');
  const [editAssetData, setEditAssetData] = useState<any>({});
  const [savingAsset, setSavingAsset] = useState(false);

  const [isNewAssetModalOpen, setNewAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ model: '', type: 'HARDWARE', tagNumber: '', serial: '', value: 0 });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const {
    paginated, totalPages, page, setPage,
    search, setSearch, type, setType, status, setStatus, location, setLocation, department, setDepartment, reset: resetFilters
  } = useFilteredData(assets, { pageSize: 12 });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get(`/assets?companyId=${user?.companyId || 'comp1'}`);
      setAssets(result.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao carregar ativos.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepsAndLocs = async () => {
    try {
        const [lRes, dRes] = await Promise.all([
            apiClient.get('/locations'),
            apiClient.get('/departments')
        ]);
        setLocations(lRes.data);
        setDepartments(dRes.data);
    } catch { /* fallback ignored */ }
  };

  useEffect(() => {
    fetchAssets();
    fetchDepsAndLocs();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/assets', { ...newAsset, companyId: user?.companyId || 'comp1' });
      addToast({ type: 'success', message: 'Ativo criado com sucesso!' });
      fetchAssets();
      setNewAssetModalOpen(false);
      setNewAsset({ model: '', type: 'HARDWARE', tagNumber: '', serial: '', value: 0 });
    } catch {
      addToast({ type: 'error', message: 'Erro ao criar ativo.' });
    }
  };

  const openAssetDetails = async (asset: any) => {
    setSelectedAsset(asset);
    setAssetModalTab('details');
    setEditAssetData({ 
        model: asset.model, 
        type: asset.type, 
        serial: asset.serial, 
        value: asset.value, 
        status: asset.status, 
        tagNumber: asset.tagNumber,
        locationId: asset.locationId,
        departmentId: asset.departmentId
    });
    setLoadingHistory(true);
    try {
      const result = await apiClient.get(`/assets/${asset.id}/history`);
      setAssetHistory(result.data);
    } catch (err) {
      setAssetHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveAssetEdit = async () => {
    setSavingAsset(true);
    try {
      const res = await apiClient.put(`/assets/${selectedAsset.id}`, { ...editAssetData, value: Number(editAssetData.value) });
      setAssets(a => a.map(x => x.id === selectedAsset.id ? { ...x, ...res.data } : x));
      setSelectedAsset({ ...selectedAsset, ...res.data });
      addToast({ type: 'success', message: 'Ativo atualizado!' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao salvar alterações.' });
    }
    setSavingAsset(false);
    setAssetModalTab('details');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return <span className="badge badge-available">Livre</span>;
      case 'IN_USE': return <span className="badge badge-inuse">Em Uso</span>;
      case 'MAINTENANCE': return <span className="badge" style={{background: '#f59e0b', color: 'white'}}>Manutenção</span>;
      case 'RETIRED': return <span className="badge" style={{background: '#ef4444', color: 'white'}}>Baixado</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const ENUM_MAP: Record<string, string> = {
    AVAILABLE: 'Livre', IN_USE: 'Em Uso', MAINTENANCE: 'Manutenção', RETIRED: 'Baixado',
    HARDWARE: 'Hardware', SOFTWARE: 'Software', ACCESSORY: 'Acessório'
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Inventário / Ativos</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Gestão e rastreabilidade de todo o parque tecnológico</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary" onClick={() => setNewAssetModalOpen(true)}>+ Novo Ativo</button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <FilterBar
          search={search} onSearch={setSearch}
          type={type} onType={setType}
          typeOptions={['HARDWARE', 'SOFTWARE', 'ACCESSORY']}
          status={status} onStatus={setStatus}
          statusOptions={['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED']}
          locationId={location} onLocation={setLocation}
          locationOptions={locations}
          departmentId={department} onDepartment={setDepartment}
          departmentOptions={departments}
          onReset={resetFilters}
        />

        {loading ? <div className="loading-state">Carregando...</div> : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Modelo do Ativo</th><th>Categoria</th><th>Tag / Série</th><th>Status</th><th>Atribuído Para</th><th style={{ textAlign: "right" }}>Ações</th></tr></thead>
              <tbody>
                {paginated.map((asset, index) => (
                  <tr key={asset.id ?? index} style={{ cursor: "pointer" }} onClick={() => openAssetDetails(asset)}>
                    <td style={{ fontWeight: 600 }}>{asset.model}</td>
                    <td><span className="badge badge-type">{ENUM_MAP[asset.type] || asset.type}</span></td>
                    <td><div style={{ fontFamily: "monospace" }}>{asset.tagNumber}</div><div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>SN: {asset.serial}</div></td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td>
                      {asset.assignedUser ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span 
                            style={{ color: '#60a5fa', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} 
                            onClick={(e) => { e.stopPropagation(); onViewCollaborator?.(asset.assignedUserId); }}
                          >
                            {asset.assignedUser}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Não atribuído</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}><button className="action-link" onClick={() => openAssetDetails(asset)}>🔧 Gerir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={assets.length} pageSize={12} />
      </div>

      {/* New Asset Modal */}
      {isNewAssetModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2.5rem', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Adicionar Novo Ativo</h2>
            <form onSubmit={handleCreateAsset}>
              <div style={{ marginBottom: '1rem' }}><input placeholder="Modelo (ex: Dell XPS)" type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} required value={newAsset.model} onChange={(e) => setNewAsset({...newAsset, model: e.target.value})} /></div>
              <div style={{ marginBottom: '1rem' }}>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} required value={newAsset.type} onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}>
                  <option value="HARDWARE" style={{ background: '#1e1e2e', color: 'white' }}>Hardware</option>
                  <option value="SOFTWARE" style={{ background: '#1e1e2e', color: 'white' }}>Software</option>
                  <option value="ACCESSORY" style={{ background: '#1e1e2e', color: 'white' }}>Acessório</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}><input placeholder="Patrimônio / Etiqueta" type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} required value={newAsset.tagNumber} onChange={(e) => setNewAsset({...newAsset, tagNumber: e.target.value})} /></div>
              <div style={{ marginBottom: '1rem' }}><input placeholder="Nº de Série" type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} required value={newAsset.serial} onChange={(e) => setNewAsset({...newAsset, serial: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><input placeholder="Valor Original (R$)" type="number" min="0" step="0.01" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} required value={newAsset.value} onChange={(e) => setNewAsset({...newAsset, value: Number(e.target.value)})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setNewAssetModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Ativo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '0', width: '800px', maxWidth: '90%', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                  <QRCodeCanvas value={`assethq://asset/${selectedAsset.id}`} size={48} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedAsset.model}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TAG: {selectedAsset.tagNumber}</span>
                    {getStatusBadge(selectedAsset.status)}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {[{ key: 'details', label: '📋 Detalhes' }, { key: 'history', label: '📜 Histórico' }, { key: 'edit', label: '✏️ Editar' }].map(({ key, label }) => (
                <button key={key} onClick={() => setAssetModalTab(key as any)} style={{ flex: 1, padding: '0.9rem', background: assetModalTab === key ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', borderBottom: assetModalTab === key ? '2px solid #3b82f6' : '2px solid transparent', color: assetModalTab === key ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ padding: '1.5rem 2rem', maxHeight: '65vh', overflowY: 'auto' }}>
              {assetModalTab === 'details' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[{ label: 'Modelo', value: selectedAsset.model }, { label: 'Categoria', value: ENUM_MAP[selectedAsset.type] || selectedAsset.type }, { label: 'Nº de Série', value: selectedAsset.serial }, { label: 'Patrimônio / Tag', value: selectedAsset.tagNumber }, { label: 'Valor Original', value: selectedAsset.value ? `R$ ${Number(selectedAsset.value).toLocaleString('pt-BR')}` : 'N/A' }, { label: 'Próxima Auditoria', value: selectedAsset.nextAuditDate ? new Date(selectedAsset.nextAuditDate).toLocaleDateString('pt-BR') : 'N/A' }].map(({ label, value }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.9rem' }}>
                        <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>{label}</div>
                        <div style={{ fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
                    {selectedAsset.status === 'AVAILABLE' && <button onClick={() => setIsAssignModalOpen(true)} className="btn-primary" style={{ flex: 1 }}>👤 Entregar Ativo</button>}
                    <button onClick={() => {
                        confirm({
                            title: 'Auditoria Física',
                            message: 'Confirma que este ativo foi conferido fisicamente hoje?',
                            onConfirm: async () => {
                                await apiClient.post(`/assets/${selectedAsset.id}/audit`);
                                addToast({ type: 'success', message: 'Auditoria logada!' });
                            }
                        });
                    }} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: 'white', padding: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🔍 Log Auditoria</button>
                    
                    <button onClick={() => {
                        confirm({
                            title: 'Iniciar Manutenção',
                            message: 'O status do ativo mudará para MANUTENÇÃO.',
                            onConfirm: async () => {
                                await apiClient.post(`/assets/${selectedAsset.id}/maintenance`, { title: 'Reparo', provider: 'Dell' });
                                addToast({ type: 'info', message: 'Manutenção iniciada' });
                                fetchAssets();
                                setSelectedAsset(null);
                            }
                        });
                    }} style={{ flex: 1, background: '#f59e0b', color: 'white', padding: '0.65rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🔧 Manutenção</button>
                    
                    {selectedAsset.status === 'IN_USE' && <button onClick={() => window.open(`http://localhost:3000/assets/${selectedAsset.id}/term`, '_blank')} className="btn-primary" style={{ flex: 1, background: '#6366f1' }}>⬇️ PDF Termo</button>}
                  </div>
                </div>
              )}
              {assetModalTab === 'history' && (
                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
                  {loadingHistory ? <p style={{ color: 'var(--text-secondary)' }}>Carregando logs...</p> : assetHistory.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nenhuma movimentação registrada.</p> : assetHistory.map((hist, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'absolute', left: '-1.85rem', top: '0.2rem', width: '0.8rem', height: '0.8rem', background: hist.returnedAt ? 'var(--text-secondary)' : '#3b82f6', borderRadius: '50%' }}></div>
                      <div style={{ fontWeight: 600 }}>Atribuído para: {hist.userName}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Check-out: {new Date(hist.assignedAt).toLocaleDateString('pt-BR')}{hist.returnedAt ? ` → Check-in: ${new Date(hist.returnedAt).toLocaleDateString('pt-BR')}` : ' (Em posse)'}</div>
                    </div>
                  ))}
                </div>
              )}
              {assetModalTab === 'edit' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[{ label: 'Modelo', key: 'model', type: 'text' }, { label: 'Nº de Série', key: 'serial', type: 'text' }, { label: 'Patrimônio / Tag', key: 'tagNumber', type: 'text' }, { label: 'Valor Original (R$)', key: 'value', type: 'number' }].map(({ label, key, type }) => (
                    <div key={key}>
                      <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>{label}</div>
                      <input type={type} style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }} value={editAssetData[key] || ''} onChange={e => setEditAssetData({ ...editAssetData, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>Categoria</div>
                    <select style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none' }} value={editAssetData.type || ''} onChange={e => setEditAssetData({ ...editAssetData, type: e.target.value })}>
                      {['HARDWARE', 'SOFTWARE', 'ACCESSORY'].map(s => <option key={s} value={s} style={{ background: '#1e1e2e' }}>{ENUM_MAP[s] || s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>Status</div>
                    <select style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none' }} value={editAssetData.status || ''} onChange={e => setEditAssetData({ ...editAssetData, status: e.target.value })}>
                      {['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s} value={s} style={{ background: '#1e1e2e' }}>{ENUM_MAP[s] || s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>Sede (Transferência)</div>
                    <select style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none' }} value={editAssetData.locationId || ''} onChange={e => setEditAssetData({ ...editAssetData, locationId: e.target.value })}>
                      <option value="">Sem Sede Fixa</option>
                      {locations.map(l => <option key={l.id} value={l.id} style={{ background: '#1e1e2e' }}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const }}>Setor</div>
                    <select style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', outline: 'none' }} value={editAssetData.departmentId || ''} onChange={e => setEditAssetData({ ...editAssetData, departmentId: e.target.value })}>
                      <option value="">Sem Setor</option>
                      {departments.map(d => <option key={d.id} value={d.id} style={{ background: '#1e1e2e' }}>{d.name}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button onClick={() => {
                        confirm({
                            title: 'Excluir Ativo',
                            message: 'Esta ação não pode ser desfeita. Deseja deletar definitivamente?',
                            danger: true,
                            onConfirm: async () => {
                                await apiClient.delete(`/assets/${selectedAsset.id}`);
                                addToast({ type: 'success', message: 'Ativo excluído' });
                                fetchAssets();
                                setSelectedAsset(null);
                            }
                        });
                    }} className="btn-danger" style={{ marginRight: 'auto' }}>Excluir Ativo</button>
                    
                    <button onClick={() => setAssetModalTab('details')} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSaveAssetEdit} disabled={savingAsset} className="btn-primary">{savingAsset ? 'Salvando...' : 'Salvar Alterações'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isAssignModalOpen && selectedAsset && (
          <AssignAssetModal
              asset={selectedAsset}
              onClose={() => setIsAssignModalOpen(false)}
              onAssigned={() => { fetchAssets(); setSelectedAsset(null); }}
          />
      )}
    </>
  );
};
