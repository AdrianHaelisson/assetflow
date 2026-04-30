import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

import { LicensesTab } from './components/LicensesTab';
import { ComponentsTab } from './components/ComponentsTab';
import { AccessoriesTab } from './components/AccessoriesTab';
import { LocationsTab } from './components/LocationsTab';
import { CollaboratorsTab } from './components/CollaboratorsTab';
import { ConsumablesTab } from './components/ConsumablesTab';
import { ReportsTab } from './components/ReportsTab';
import { AssetsTab } from './components/AssetsTab';

import { apiClient } from './lib/apiClient';
import { useAuthStore } from './store/authStore';
import { useToastStore } from './store/toastStore';
import { useConfirmStore } from './store/confirmStore';

import { StatsCards } from './components/dashboard/StatsCards';
import { AssetStatusChart, MovementTimeline } from './components/dashboard/Charts';
import { ActivityFeed } from './components/dashboard/ActivityFeed';
import { FilterBar } from './components/ui/FilterBar';
import { Pagination } from './components/ui/Pagination';
import { AssignAssetModal } from './components/AssignAssetModal';
import { useFilteredData } from './hooks/useFilteredData';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'collaborators' | 'consumables' | 'licenses' | 'accessories' | 'components' | 'reports' | 'locations'>('dashboard');
  const [viewCollaboratorId, setViewCollaboratorId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const addToast = useToastStore(s => s.add);
  const confirm = useConfirmStore(s => s.open);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const result = await apiClient.get('/assets/stats').catch(() => {
          const totalValue = assets.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
          const statusCounts = assets.reduce((acc: any, curr: any) => {
              acc[curr.status] = (acc[curr.status] || 0) + 1;
              return acc;
          }, {});
          return { data: {
              total: assets.length,
              inUse: statusCounts['IN_USE'] || 0,
              available: statusCounts['AVAILABLE'] || 0,
              maintenance: statusCounts['MAINTENANCE'] || 0,
              retired: statusCounts['RETIRED'] || 0,
              totalValue,
              statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count: count as number }))
          }};
      });
      setStats(result.data);
    } catch (err) {
      // fallback
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
        fetchStats();
    }
  }, [activeTab]);

  const handleViewCollaborator = (id: string) => {
    setViewCollaboratorId(id);
    setActiveTab('collaborators');
  };

  const handleLogout = () => {
      confirm({
          title: 'Logout',
          message: 'Deseja realmente sair do sistema?',
          confirmLabel: 'Sair Agora',
          danger: true,
          onConfirm: () => {
              logout();
              window.location.reload();
          }
      });
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
    HARDWARE: 'Hardware', SOFTWARE: 'Software'
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand-title">AssetFlow</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {user?.name?.[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Administrador'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role || 'Admin'}</div>
            </div>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'collaborators' ? 'active' : ''}`} onClick={() => setActiveTab('collaborators')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Colaboradores
          </div>
          <div className={`nav-item ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Sedes e Setores
          </div>
          <div className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Inventário / Ativos
          </div>
          <div className={`nav-item ${activeTab === 'consumables' ? 'active' : ''}`} onClick={() => setActiveTab('consumables')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            Consumíveis
          </div>
          
          <div style={{ padding: '1rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>GERENCIAMENTO DE TI</div>
          
          <div className={`nav-item ${activeTab === 'licenses' ? 'active' : ''}`} onClick={() => setActiveTab('licenses')}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Licenças SaaS
          </div>

          <div className={`nav-item ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Componentes
          </div>

          <div style={{ padding: '1rem', paddingLeft: '1.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>

          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Relatórios
          </div>

          <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#f87171' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sair
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div style={{ minWidth: 0 }}>
              <header className="page-header">
                <div>
                  <h1 className="page-title">Dashboard de Ativos</h1>
                  <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Visão Geral de Hardware, Software e Infraestrutura</p>
                </div>
              </header>

              <StatsCards data={stats} loading={loadingStats} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Distribuição por Status</h3>
                  <AssetStatusChart data={stats?.statusDistribution || []} />
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Movimentação Recente</h3>
                  <MovementTimeline />
                </div>
              </div>
            </div>

            <aside>
                <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '3rem' }}>
                    <ActivityFeed />
                </div>
            </aside>
          </div>
        )}

        {activeTab === 'assets' && <AssetsTab onViewCollaborator={handleViewCollaborator} />}
        {activeTab === 'licenses' && <LicensesTab />}

        {activeTab === 'components' && <ComponentsTab />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'collaborators' && <CollaboratorsTab viewCollaboratorId={viewCollaboratorId} onClearViewCollaborator={() => setViewCollaboratorId(null)} />}
        {activeTab === 'consumables' && <ConsumablesTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
}

export default App;
