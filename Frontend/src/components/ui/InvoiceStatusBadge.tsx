import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface Props {
  statut: string;
}

const InvoiceStatusBadge: React.FC<Props> = ({ statut }) => {
  const { t } = useSettings();

  const labels: Record<string, string> = {
    BROUILLON: t.status.BROUILLON,
    ENVOYEE:   t.status.ENVOYEE,
    PAYEE:     t.status.PAYEE,
    EN_RETARD: t.status.EN_RETARD,
  };

  const styleMap: Record<string, string> = {
    PAYEE:     'badge badge-green',
    ENVOYEE:   'badge badge-blue',
    EN_RETARD: 'badge badge-red',
    BROUILLON: 'badge badge-gray',
  };

  const dotColor: Record<string, string> = {
    PAYEE:     'var(--success)',
    ENVOYEE:   'var(--accent)',
    EN_RETARD: 'var(--danger)',
    BROUILLON: 'var(--text-3)',
  };

  return (
    <span className={styleMap[statut] ?? 'badge badge-gray'}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor[statut] ?? 'var(--text-3)',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {labels[statut] ?? statut}
    </span>
  );
};

export default InvoiceStatusBadge;
