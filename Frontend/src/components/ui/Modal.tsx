import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<Props> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const maxWidths: Record<string, string> = {
    sm: '400px',
    md: '480px',
    lg: '640px',
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-box animate-fade-up"
        style={{ maxWidth: maxWidths[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
