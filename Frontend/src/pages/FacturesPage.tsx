import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Download, Mail, CheckCircle, Copy, Trash2, Edit } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { useSettings } from '../context/SettingsContext';
import type { Facture } from '../types';
import InvoiceStatusBadge from '../components/ui/InvoiceStatusBadge';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FacturesPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { t, lang } = useSettings();

  const load = async () => {
    try {
      const data = await invoiceService.getAll();
      setFactures(data);
    } catch {
      toast.error(t.invoices.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: () => Promise<any>, msg: string) => {
    setActionLoading(id);
    try {
      await action();
      toast.success(msg);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.invoices.error);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = factures.filter((f) =>
    f.numero.toLowerCase().includes(search.toLowerCase()) ||
    f.client.nom.toLowerCase().includes(search.toLowerCase())
  );

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(val);

  const fmtDate = (str: string) =>
    new Date(str).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.invoices.title}</h1>
          <p className="page-subtitle">{t.invoices.subtitle}</p>
        </div>
        <Link to="/newfactures" className="btn btn-primary">
          <Plus size={15} />
          {t.invoices.newInvoice}
        </Link>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="search-bar" style={{ maxWidth: 380 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder={t.invoices.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.invoices.number}</th>
              <th>{t.invoices.client}</th>
              <th>{t.invoices.date}</th>
              <th>{t.invoices.due}</th>
              <th>{t.invoices.status}</th>
              <th style={{ textAlign: 'right' }}>{t.invoices.total}</th>
              <th style={{ textAlign: 'right' }}>{t.invoices.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: 14, width: j === 0 ? 80 : j === 5 ? 70 : j === 6 ? 100 : 100 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 0 }}>
                  <div className="empty-state" style={{ padding: '60px 24px' }}>
                    <div className="empty-state-icon"><FileText size={24} /></div>
                    <p className="empty-state-title">{t.invoices.noInvoice}</p>
                    <p className="empty-state-sub">{t.invoices.createFirst}</p>
                    <Link to="/newfactures" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                      <Plus size={14} /> {t.invoices.newInvoice}
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr
                  key={f.id}
                  style={{
                    opacity: actionLoading === f.id ? 0.4 : 1,
                    pointerEvents: actionLoading === f.id ? 'none' : 'auto',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        background: 'var(--accent-subtle)',
                        padding: '2px 8px',
                        borderRadius: 5,
                      }}
                    >
                      #{f.numero}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{f.client.nom}</div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{fmtDate(f.date)}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{fmtDate(f.echeance)}</td>
                  <td>
                    <InvoiceStatusBadge statut={f.statut} />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                    {fmtCurrency(f.totalTTC)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      {f.statut === 'BROUILLON' && (
                        <Link
                          to={`/factures/edit/${f.id}`}
                          className="icon-btn"
                          title="Modifier"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Edit size={15} />
                        </Link>
                      )}
                      {f.statut !== 'PAYEE' && f.statut !== 'BROUILLON' && (
                        <button
                          className="icon-btn"
                          onClick={() => handleAction(f.id, () => invoiceService.markAsPaid(f.id), t.invoices.paid)}
                          title={t.invoices.markPaid}
                          style={{ color: 'var(--success)' }}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button
                        className="icon-btn"
                        onClick={() => handleAction(f.id, () => invoiceService.sendByEmail(f.id), t.invoices.emailSent)}
                        title={t.invoices.send}
                      >
                        <Mail size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => invoiceService.downloadPdf(f.id, f.numero)}
                        title={t.invoices.download}
                      >
                        <Download size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleAction(f.id, () => invoiceService.duplicate(f.id), t.invoices.duplicated)}
                        title={t.invoices.duplicate}
                      >
                        <Copy size={15} />
                      </button>
                      {f.statut === 'BROUILLON' && (
                        <button
                          className="icon-btn danger"
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                              handleAction(f.id, () => invoiceService.delete(f.id), 'Facture supprimée');
                            }
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacturesPage;
