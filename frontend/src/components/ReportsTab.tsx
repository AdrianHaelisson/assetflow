import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { apiClient } from '../lib/apiClient';

export const ReportsTab = () => {
  const [report, setReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/reports');
      setReport(res.data);
    } catch {
      setReport({ 
        totalAssets: 15, 
        totalAcquisitionValue: 45000, 
        currentDepreciatedValue: 32000.50, 
        statusDistribution: { AVAILABLE: 10, IN_USE: 5, MAINTENANCE: 0, RETIRED: 0 } 
      });
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // Mock data for the depreciation chart
  const depreciationData = [
    { month: 'Jan', bruto: 45000, atual: 45000 },
    { month: 'Fev', bruto: 45000, atual: 42000 },
    { month: 'Mar', bruto: 45000, atual: 39000 },
    { month: 'Abr', bruto: 45000, atual: 36000 },
    { month: 'Mai', bruto: 45000, atual: 32000 },
  ];

  const statusData = report ? [
    { name: 'Disponível', quantidade: report.statusDistribution?.AVAILABLE || 0, fill: '#10b981' },
    { name: 'Em Uso', quantidade: report.statusDistribution?.IN_USE || 0, fill: '#3b82f6' },
    { name: 'Manutenção', quantidade: report.statusDistribution?.MAINTENANCE || 0, fill: '#f59e0b' },
    { name: 'Baixado', quantidade: report.statusDistribution?.RETIRED || 0, fill: '#ef4444' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', overflowY: 'auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Painel de Relatórios</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Inteligência Contábil e Operacional AssetFlow</p>
        </div>
        <button className="btn-primary" style={{ background: '#3b82f6' }}>Exportar Relatório Global (CSV)</button>
      </header>

      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Custo Bruto Original</h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>
                    R$ {report.totalAcquisitionValue.toLocaleString('pt-BR')}
                  </div>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor Atual (Pós-Depreciação)</h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#a855f7' }}>
                    R$ {report.currentDepreciatedValue.toLocaleString('pt-BR')}
                  </div>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total de Ativos Mapeados</h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#white' }}>
                    {report.totalAssets} Und
                  </div>
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Projeção de Depreciação (Sintético)</h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={depreciationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        <Legend />
                        <Area type="monotone" dataKey="bruto" stroke="#ef4444" fill="none" name="Valor Bruto Compra" />
                        <Area type="monotone" dataKey="atual" stroke="#a855f7" fillOpacity={1} fill="url(#colorAtual)" name="Valor Depreciado" />
                      </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Distribuição de Status no Parque</h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-secondary)" />
                        <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
