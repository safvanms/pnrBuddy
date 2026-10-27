import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileJson, ExternalLink } from 'lucide-react';

export default function IndianRailJsonModal({ officialData, pnr, onClose }) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(officialData, null, 2);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileJson size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Official Indian Railways PRS JSON Response</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Exact CRIS / indianrail.gov.in CommonCaptcha response schema (Bypassed & Real-Time)
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--surface-glass-border)',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Direct API URL: </span>
              <code style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                /api/pnr/{pnr}?format=raw
              </code>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
            </button>
          </div>

          <div style={{
            background: '#040711',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.25rem',
            maxHeight: '440px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#a5f3fc',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {jsonString}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--surface-glass-border)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Server Node: <code>CRIS-PRS-NDLS-01</code> • Captcha: Bypassed
            </span>
            <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
