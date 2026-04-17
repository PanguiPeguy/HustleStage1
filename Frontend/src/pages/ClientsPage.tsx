import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Hash, Users, MoreHorizontal } from 'lucide-react';
import { clientService } from '../services/clientService';
import { useSettings } from '../context/SettingsContext';
import type { Client } from '../types';
import ClientModal from '../components/clients/ClientModal';
import toast from 'react-hot-toast';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { t } = useSettings();

  const load = async (q?: string) => {
    try {
      const data = await clientService.getAll(q);
      setClients(data);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    try {
      await clientService.delete(id);
      toast.success(t.clients.deleted);
      setDeleteId(null);
      load(search || undefined);
    } catch {
      toast.error(t.common.error);
    }
  };

  const openCreate = () => { setEditClient(null); setModalOpen(true); };
  const openEdit   = (c: Client) => { setEditClient(c); setModalOpen(true); };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.clients.title}</h1>
          <p className="page-subtitle">
            {clients.length} {clients.length > 1 ? 'clients' : 'client'} dans votre base
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={15} />
          {t.clients.newClient}
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder={t.clients.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 12, width: '80%' }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="card-flat" style={{ padding: 0 }}>
          <div className="empty-state" style={{ padding: '80px 24px' }}>
            <div className="empty-state-icon">
              <Users size={24} />
            </div>
            <p className="empty-state-title">{t.clients.noClient}</p>
            <p className="empty-state-sub">{t.clients.noClientSub}</p>
            <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 12 }}>
              <Plus size={15} />
              {t.clients.addClient}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {clients.map((client) => (
            <div
              key={client.id}
              className="card"
              style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="avatar"
                    style={{
                      width: 42,
                      height: 42,
                      fontSize: 17,
                      borderRadius: 10,
                    }}
                  >
                    {client.nom[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: 'var(--text)',
                        letterSpacing: -0.2,
                        marginBottom: 2,
                      }}
                    >
                      {client.nom}
                    </div>
                    <span className="badge badge-blue" style={{ fontSize: 11 }}>
                      {client.nombreFactures} {client.nombreFactures > 1 ? t.dashboard.invoices : t.dashboard.invoice}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" onClick={() => openEdit(client)} title={t.clients.edit}>
                    <Edit2 size={14} />
                  </button>
                  <button className="icon-btn danger" onClick={() => setDeleteId(client.id)} title={t.clients.delete}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {client.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                    <Mail size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.email}
                    </span>
                  </div>
                )}
                {client.telephone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                    <Phone size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>{client.telephone}</span>
                  </div>
                )}
                {client.siret && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                    <Hash size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{client.siret}</span>
                  </div>
                )}
                {!client.email && !client.telephone && !client.siret && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Aucune information de contact</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="modal-overlay animate-fade-in" onClick={() => setDeleteId(null)}>
          <div
            className="modal-box animate-fade-up"
            style={{ maxWidth: 400, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-body" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'var(--danger-sub)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Trash2 size={22} style={{ color: 'var(--danger)' }} />
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: 8,
                  letterSpacing: -0.3,
                }}
              >
                {t.clients.deleteTitle}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>
                {t.clients.deleteMsg}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t.clients.cancel}
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="btn btn-danger"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t.clients.confirmDelete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        client={editClient}
        onSuccess={() => load(search || undefined)}
      />
    </div>
  );
};

export default ClientsPage;
