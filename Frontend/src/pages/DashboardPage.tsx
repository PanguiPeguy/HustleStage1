import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Users, FileText, Euro,
  Clock, CheckCircle, AlertTriangle, FileEdit,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { useSettings } from '../context/SettingsContext';
import type { DashboardStats } from '../types';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang, darkMode } = useSettings();

  const fmt = (val: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => toast.error(t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div className="spinner spinner-lg" />
        <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{t.dashboard.loading}</p>
      </div>
    );
  }

  if (!stats) return null;

  const kpiCards = [
    {
      label: t.dashboard.totalRevenue,
      value: fmt(stats.caTotal),
      icon: Euro,
      iconBg: 'var(--accent-subtle)',
      iconColor: 'var(--accent)',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: t.dashboard.collected,
      value: fmt(stats.caEncaisse),
      icon: CheckCircle,
      iconBg: 'var(--success-sub)',
      iconColor: 'var(--success)',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: t.dashboard.toCashIn,
      value: fmt(stats.caAEncaisser),
      icon: Clock,
      iconBg: 'var(--warning-sub)',
      iconColor: 'var(--warning)',
      trend: '-2%',
      trendUp: false,
    },
    {
      label: t.dashboard.activeClients,
      value: stats.totalClients.toString(),
      icon: Users,
      iconBg: 'rgba(139,92,246,0.1)',
      iconColor: '#8B5CF6',
      trend: '+5%',
      trendUp: true,
    },
  ];

  const pieData = [
    { name: t.status.BROUILLON, value: stats.facturesBrouillon },
    { name: t.status.PAYEE,     value: stats.facturesPayees },
    { name: t.status.ENVOYEE,   value: stats.facturesEnvoyees },
    { name: t.status.EN_RETARD, value: stats.facturesEnRetard },
  ].filter((d) => d.value > 0);

  const activityItems = [
    { label: t.dashboard.total,  value: stats.totalFactures,       icon: FileText,      color: 'var(--accent)' },
    { label: t.dashboard.drafts, value: stats.facturesBrouillon,   icon: FileEdit,      color: 'var(--text-3)' },
    { label: t.dashboard.sent,   value: stats.facturesEnvoyees,    icon: TrendingUp,    color: 'var(--success)' },
    { label: t.dashboard.late,   value: stats.facturesEnRetard,    icon: AlertTriangle, color: 'var(--danger)' },
  ];

  const tooltipStyle = {
    backgroundColor: darkMode ? '#0D1526' : '#fff',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    fontSize: 13,
    color: 'var(--text)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.dashboard.title}</h1>
          <p className="page-subtitle">{t.dashboard.subtitle}</p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-3)',
            fontWeight: 500,
          }}
        >
          <span
            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)', display: 'inline-block' }}
          />
          Live
        </div>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {kpiCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div
                className="stat-icon"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                <card.icon size={18} />
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: card.trendUp ? 'var(--success-sub)' : 'var(--danger-sub)',
                  color: card.trendUp ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {card.trend}
              </span>
            </div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Area Chart */}
        <div className="chart-card">
          <div className="chart-title">{t.dashboard.revenueChart}</div>
          <div style={{ height: 280 }}>
            {stats.evolutionMensuelle.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.evolutionMensuelle} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  />
                  <XAxis
                    dataKey="mois"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Inter' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Inter' }}
                    tickFormatter={(v) => `${v}€`}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#colorCA)"
                    dot={{ r: 3, fill: '#3B82F6', stroke: darkMode ? '#0D1526' : '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#3B82F6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={22} /></div>
                <p className="empty-state-title">{t.dashboard.noData}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">{t.dashboard.statusChart}</div>
          {pieData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => (
                      <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 500 }}>{val}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ flex: 1 }}>
              <p className="empty-state-sub">{t.dashboard.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Activity */}
        <div className="card-flat" style={{ padding: '20px 24px' }}>
          <div className="section-header">
            <span className="section-title">Flux d'activité</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {activityItems.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <item.icon size={16} style={{ color: item.color, marginBottom: 10 }} />
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 4 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-3)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="card-flat" style={{ padding: '20px 24px' }}>
          <div className="section-header">
            <span className="section-title">{t.dashboard.topClients}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.topClients.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                {t.dashboard.noData}
              </p>
            ) : (
              stats.topClients.map((client, i) => {
                const maxVal = stats.topClients[0]?.montantTotal || 1;
                const pct = (client.montantTotal / maxVal) * 100;
                return (
                  <div key={client.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: 'var(--accent-subtle)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{client.nom}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{fmt(client.montantTotal)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
