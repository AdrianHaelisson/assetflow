import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { apiClient } from '../lib/apiClient';

export const ReportsTab = () => {
  const [report, setReport] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

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

  const handleExportXLSX = async () => {
    setExporting(true);
    try {
      const [assetsRes, usersRes] = await Promise.all([
        apiClient.get('/assets?companyId=comp1'),
        apiClient.get('/users?companyId=comp1'),
      ]);

      const assets = assetsRes.data || [];
      const users = usersRes.data || [];

      const STATUS_MAP: Record<string, string> = {
        AVAILABLE: 'Disponível', IN_USE: 'Em Uso', MAINTENANCE: 'Manutenção', RETIRED: 'Baixado'
      };
      const TYPE_MAP: Record<string, string> = {
        HARDWARE: 'Hardware', SOFTWARE: 'Software', ACCESSORY: 'Acessório'
      };

      // Aba 1 - Inventário de Ativos
      const assetsSheet = assets.map((a: any) => ({
        'Tag / Patrimônio': a.tagNumber,
        'Modelo': a.model,
        'Categoria': TYPE_MAP[a.type] || a.type,
        'Status': STATUS_MAP[a.status] || a.status,
        'Nº de Série': a.serial,
        'Valor Original (R$)': Number(a.value).toFixed(2),
        'Valor Atual (R$)': Number(a.currentValue ?? a.value).toFixed(2),
        'Responsável Atual': a.assignedUser || '—',
        'Sede': a.locationId || '—',
        'Data Compra': a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString('pt-BR') : '—',
      }));

      // Aba 2 - Colaboradores
      const usersSheet = users.map((u: any) => ({
        'Nome': u.name,
        'E-mail': u.email,
        'Cargo': u.role,
        'Sede': u.locationName || '—',
        'Setor': u.departmentName || '—',
        'Nº de Ativos': u.assetCount ?? 0,
        'Cadastrado em': u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—',
      }));

      // Aba 3 - Resumo financeiro
      const summarySheet = [
        { 'Indicador': 'Total de Ativos', 'Valor': assets.length },
        { 'Indicador': 'Custo Bruto Original (R$)', 'Valor': assets.reduce((acc: number, a: any) => acc + Number(a.value || 0), 0).toFixed(2) },
        { 'Indicador': 'Valor Atual Depreciado (R$)', 'Valor': assets.reduce((acc: number, a: any) => acc + Number(a.currentValue ?? a.value ?? 0), 0).toFixed(2) },
        { 'Indicador': 'Em Uso', 'Valor': assets.filter((a: any) => a.status === 'IN_USE').length },
        { 'Indicador': 'Disponíveis', 'Valor': assets.filter((a: any) => a.status === 'AVAILABLE').length },
        { 'Indicador': 'Em Manutenção', 'Valor': assets.filter((a: any) => a.status === 'MAINTENANCE').length },
        { 'Indicador': 'Baixados', 'Valor': assets.filter((a: any) => a.status === 'RETIRED').length },
        { 'Indicador': 'Hardware', 'Valor': assets.filter((a: any) => a.type === 'HARDWARE').length },
        { 'Indicador': 'Acessórios', 'Valor': assets.filter((a: any) => a.type === 'ACCESSORY').length },
        { 'Indicador': 'Software', 'Valor': assets.filter((a: any) => a.type === 'SOFTWARE').length },
        { 'Indicador': 'Total de Colaboradores', 'Valor': users.length },
        { 'Indicador': 'Data do Relatório', 'Valor': new Date().toLocaleDateString('pt-BR') },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assetsSheet), 'Inventário de Ativos');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usersSheet), 'Colaboradores');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), 'Resumo Financeiro');

      const filename = `AssetFlow_Relatorio_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Erro ao exportar:', err);
    } finally {
      setExporting(false);
    }
  };

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
        <button
          className="btn-primary"
          style={{ background: exporting ? '#374151' : '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: exporting ? 0.7 : 1 }}
          onClick={handleExportXLSX}
          disabled={exporting}
        >
          {exporting ? '⏳ Gerando...' : '📥 Exportar Relatório Global (.xlsx)'}
        </button>
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
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white' }}>
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

