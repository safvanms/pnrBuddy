import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      className="notification-toast"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--accent-cyan)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(6, 182, 212, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '400px',
        animation: 'slide-in 0.25s ease'
      }}
    >
      <CheckCircle2 size={18} style={{ color: 'var(--status-cnf)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
