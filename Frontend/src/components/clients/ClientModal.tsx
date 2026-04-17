import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import type { Client, ClientRequest } from '../../types';
import { clientService } from '../../services/clientService';
import { useSettings } from '../../context/SettingsContext';
import { User, Mail, Phone, MapPin, Hash } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

const ClientModal: React.FC<Props> = ({ isOpen, onClose, client, onSuccess }) => {
  const isEdit = !!client;
  const [loading, setLoading] = useState(false);
  const { t } = useSettings();

  const [form, setForm] = useState<ClientRequest>({
    nom:       client?.nom       || '',
    email:     client?.email     || '',
    telephone: client?.telephone || '',
    adresse:   client?.adresse   || '',
    siret:     client?.siret     || '',
  });

  React.useEffect(() => {
    setForm({
      nom:       client?.nom       || '',
      email:     client?.email     || '',
      telephone: client?.telephone || '',
      adresse:   client?.adresse   || '',
      siret:     client?.siret     || '',
    });
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast.error('Le nom est requis'); return; }
    setLoading(true);
    try {
      if (isEdit && client) {
        await clientService.update(client.id, form);
        toast.success('Client mis à jour');
      } else {
        await clientService.create(form);
        toast.success('Client créé');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nom',       label: t.clientModal.name,    placeholder: t.clientModal.namePlaceholder,    type: 'text',  icon: User,   required: true },
    { key: 'email',     label: t.clientModal.email,   placeholder: t.clientModal.emailPlaceholder,   type: 'email', icon: Mail,   required: false },
    { key: 'telephone', label: t.clientModal.phone,   placeholder: t.clientModal.phonePlaceholder,   type: 'tel',   icon: Phone,  required: false },
    { key: 'adresse',   label: t.clientModal.address, placeholder: t.clientModal.addressPlaceholder, type: 'text',  icon: MapPin, required: false },
    { key: 'siret',     label: t.clientModal.siret,   placeholder: t.clientModal.siretPlaceholder,   type: 'text',  icon: Hash,   required: false },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t.clientModal.edit : t.clientModal.create}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map(({ key, label, placeholder, type, icon: Icon, required }) => (
          <div key={key} className="form-group">
            <label className="form-label">
              {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <Icon
                size={15}
                className="form-icon form-icon-left"
                style={{ color: 'var(--text-3)' }}
              />
              <input
                type={type}
                className="form-input has-icon-left"
                placeholder={placeholder}
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
              />
            </div>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t.clientModal.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              isEdit ? t.clientModal.editBtn : t.clientModal.createBtn
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;
